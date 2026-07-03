import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { P } from '@/lib/tokens'
import { Card } from '@/components/ui/card'
import { Btn } from '@/components/ui/btn'
import { Icon } from '@/lib/icons'
import { Switch } from '@/components/ui/switch'
import { AddGroupModal } from '@/components/add-group-modal'
import { useAppStore } from '@/store/app-store'
import type { WhatsAppGroup } from '@/store/app-store'

export function GroupsPage() {
  const setToast = useAppStore((s: { setToast: (msg: string | null) => void }) => s.setToast)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Id<'groups'> | null>(null)
  const [search, setSearch] = useState('')

  const convexGroups = useQuery(api.groups.list)
  const addGroupMut = useMutation(api.groups.add)
  const toggleMut = useMutation(api.groups.toggleActive)
  const removeMut = useMutation(api.groups.remove)

  const groups: WhatsAppGroup[] = (convexGroups ?? []).map((g) => ({
    id: g._id,
    name: g.name,
    active: g.isActive,
    groupId: g.whatsappId,
  }))

  const activeCount = groups.filter((g) => g.active).length
  const filteredGroups = search.trim()
    ? groups.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()))
    : groups

  const toggleGroup = (id: string) => {
    toggleMut({ id: id as Id<'groups'> }).catch((err: unknown) => {
      setToast('Error: ' + String(err))
    })
  }

  const addGroup = (name: string, credential: string, mode: 'link' | 'id') => {
    addGroupMut({ name, whatsappId: credential, mode })
      .then(() => {
        setShowAddModal(false)
        setToast(
          mode === 'link'
            ? 'Group added · waiting for admin approval'
            : 'Group added · will start broadcasting tonight',
        )
      })
      .catch((err: unknown) => {
        setToast('Error: ' + String(err))
      })
  }

  const deleteGroup = (id: Id<'groups'>) => {
    removeMut({ id })
      .then(() => {
        setConfirmDelete(null)
        setToast('Group removed')
      })
      .catch((err: unknown) => {
        setToast('Error: ' + String(err))
      })
  }

  const abbrev = (name: string) => {
    const part = name.split('·')[1]
    return part ? part.trim().slice(0, 2).toUpperCase() : 'TT'
  }

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 16px 16px' }} className="md:p-0">
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Groups</div>
          <div style={{ fontSize: 12, color: P.inkSoft, marginTop: 2 }}>{activeCount} active of {groups.length} total · devotionals broadcast to every active group at send time</div>
        </div>
        <Btn variant="primary" onClick={() => setShowAddModal(true)} style={{ flexShrink: 0 }}>
          <Icon name="plus" size={13} color="#FFF" /> Add a group
        </Btn>
      </div>

      <div className="md:hidden" style={{ fontSize: 12, color: P.inkSoft, marginBottom: 12 }}>
        {activeCount} active of {groups.length} total
      </div>

      {convexGroups !== undefined && convexGroups.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
            <Icon name="search" size={14} color={P.inkFaint} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups…"
            style={{
              width: '100%', padding: '10px 12px 10px 34px', border: `1px solid ${P.line}`, borderRadius: 8,
              background: P.surface, fontSize: 13, fontFamily: P.sans, boxSizing: 'border-box', outline: 'none', color: P.ink,
            }}
          />
        </div>
      )}

      {convexGroups === undefined && (
        <Card style={{ padding: 20, fontSize: 13, color: P.inkSoft }}>Loading…</Card>
      )}
      {convexGroups !== undefined && convexGroups.length === 0 && (
        <Card style={{ padding: 30, textAlign: 'center', fontSize: 13, color: P.inkSoft, background: P.bgSoft, border: `1px dashed ${P.line}` }}>
          No groups yet. Add one to start broadcasting.
        </Card>
      )}
      {convexGroups !== undefined && convexGroups.length > 0 && filteredGroups.length === 0 && (
        <Card style={{ padding: 30, textAlign: 'center', fontSize: 13, color: P.inkSoft, background: P.bgSoft, border: `1px dashed ${P.line}` }}>
          No groups match "{search.trim()}".
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredGroups.map((g) => (
          <Card key={g.id} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: g.active ? P.sageTint : P.surfaceAlt, color: g.active ? P.sage : P.inkSoft, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, fontFamily: P.mono, flexShrink: 0 }}>
              {abbrev(g.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
              <div style={{ fontSize: 10.5, color: P.inkSoft, fontFamily: P.mono, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.groupId ?? g.id}
              </div>
            </div>
            <Switch on={g.active} onToggle={() => toggleGroup(g.id)} />
            <button
              type="button"
              onClick={() => setConfirmDelete(g.id as Id<'groups'>)}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${P.line}`, background: P.surface, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
            >
              <Icon name="trash" size={13} color={P.inkFaint} />
            </button>
          </Card>
        ))}
      </div>
    </motion.div>

      <AddGroupModal open={showAddModal} onConfirm={addGroup} onClose={() => setShowAddModal(false)} />

      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,20,16,0.45)', zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: P.surface, borderRadius: 12, padding: 22, width: 360, maxWidth: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Remove this group?</div>
            <div style={{ fontSize: 13, color: P.inkSoft, marginBottom: 18 }}>This group will stop receiving broadcasts. This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={() => setConfirmDelete(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn
                variant="primary"
                onClick={() => deleteGroup(confirmDelete)}
                style={{ flex: 1, justifyContent: 'center', background: P.rose, borderColor: P.rose }}
              >
                Remove
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

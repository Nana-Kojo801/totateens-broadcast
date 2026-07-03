import * as RadixSelect from '@radix-ui/react-select'
import { P } from '@/lib/tokens'
import { Icon } from '@/lib/icons'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  style?: React.CSSProperties
}

const triggerStyle: React.CSSProperties = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '9px 11px',
  border: `1px solid ${P.line}`,
  borderRadius: 7,
  background: P.surface,
  fontSize: 13,
  fontFamily: P.sans,
  color: P.ink,
  cursor: 'pointer',
  outline: 'none',
}

export function Select({ value, onChange, options, placeholder, style }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger style={{ ...triggerStyle, ...style }}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <Icon name="chevronRight" size={12} color={P.inkSoft} className="rotate-90" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          style={{
            background: P.surface,
            border: `1px solid ${P.line}`,
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(14,20,16,0.16)',
            overflow: 'hidden',
            zIndex: 9600,
            width: 'var(--radix-select-trigger-width)',
            maxHeight: 'min(300px, var(--radix-select-content-available-height))',
          }}
        >
          <RadixSelect.Viewport style={{ padding: 4 }}>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: P.sans,
                  color: P.ink,
                  cursor: 'pointer',
                  outline: 'none',
                  userSelect: 'none',
                }}
                className="select-item"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Icon name="check" size={12} color={P.sage} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

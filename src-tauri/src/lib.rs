use std::sync::Mutex;
use tauri::{Manager, RunEvent};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;

struct SidecarState(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .manage(SidecarState(Mutex::new(None)))
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // WhatsApp session data lives in the app's data dir so it survives
      // app updates/reinstalls instead of getting wiped alongside the
      // sidecar binary.
      let data_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&data_dir)?;

      let sidecar = app
        .shell()
        .sidecar("totateens-wa-server")?
        .env("WA_DATA_DIR", data_dir.to_string_lossy().to_string());
      let (mut rx, child) = sidecar
        .spawn()
        .expect("failed to spawn WhatsApp server sidecar");

      *app.state::<SidecarState>().0.lock().unwrap() = Some(child);

      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          match event {
            CommandEvent::Stdout(line) => {
              log::info!("[wa-server] {}", String::from_utf8_lossy(&line));
            }
            CommandEvent::Stderr(line) => {
              log::error!("[wa-server] {}", String::from_utf8_lossy(&line));
            }
            _ => {}
          }
        }
      });

      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
      // Ask the sidecar to close its Chrome session cleanly first — a hard
      // kill leaves an orphaned Chrome process behind on Windows since it
      // never gets a chance to run whatsapp-web.js's own cleanup. Give it a
      // moment, then hard-kill regardless as a guaranteed fallback so the
      // app never hangs on exit.
      if let RunEvent::Exit = event {
        let state = app_handle.state::<SidecarState>();
        let maybe_child = state.0.lock().unwrap().take();
        if let Some(mut child) = maybe_child {
          let _ = child.write(b"shutdown\n");
          std::thread::sleep(std::time::Duration::from_millis(1500));
          let _ = child.kill();
        }
      }
    });
}

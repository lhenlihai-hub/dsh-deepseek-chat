/**
 * Inline stylesheet for the browser half. Injected as one
 * <style data-plugin="dsh-deepseek-chat"> tag (the GUI removes plugin-owned
 * tags on unload; we remove it ourselves on dispose too).
 *
 * Light tokens are the default; `body[data-ds-dark-theme]` overrides mirror
 * the shell's dark marker, the same convention official UI plugins follow.
 * @module dsh-deepseek-chat/client/styles
 */

export const STYLE_TAG_ID = 'dsh-deepseek-chat'

export const CSS = `
/* ---------- floating entry ---------- */
.ddsc-entry {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 900;
  writing-mode: vertical-rl;
  padding: 14px 7px;
  border: 1px solid #d8dce3;
  border-right: none;
  border-radius: 8px 0 0 8px;
  background: #ffffff;
  color: #3b62d9;
  font-size: 13px;
  letter-spacing: 2px;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
  transition: background 0.15s, color 0.15s;
  user-select: none;
}
.ddsc-entry:hover { background: #3b62d9; color: #ffffff; }

/* ---------- floating window (default 4:3, draggable, resizable) ---------- */
.ddsc-window {
  position: fixed;
  z-index: 901;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  border: 1px solid #d8dce3;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
  color: #1f2329;
  animation: ddsc-pop-in 0.16s ease-out;
}
@keyframes ddsc-pop-in {
  from { transform: scale(0.98); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* ---------- title bar (drag handle) ---------- */
.ddsc-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e8ee;
  flex: none;
  cursor: move;
  user-select: none;
  touch-action: none;
}
.ddsc-title { font-size: 14px; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ddsc-select {
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid #d8dce3;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2329;
  max-width: 150px;
}
.ddsc-icon-btn {
  border: none;
  background: transparent;
  color: #646a73;
  font-size: 15px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  line-height: 1;
  flex: none;
}
.ddsc-icon-btn:hover { background: #eef0f4; color: #1f2329; }

/* ---------- resize handle (bottom-right corner) ---------- */
.ddsc-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  cursor: nwse-resize;
  touch-action: none;
  background:
    linear-gradient(135deg, transparent 0 55%, #c3c9d4 55% 60%, transparent 60% 70%, #c3c9d4 70% 75%, transparent 75% 85%, #c3c9d4 85% 90%, transparent 90%);
  border-bottom-right-radius: 12px;
}
.ddsc-resize-handle:hover {
  background:
    linear-gradient(135deg, transparent 0 55%, #3b62d9 55% 60%, transparent 60% 70%, #3b62d9 70% 75%, transparent 75% 85%, #3b62d9 85% 90%, transparent 90%);
}

/* ---------- messages ---------- */
.ddsc-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ddsc-empty {
  margin: auto;
  color: #8f959e;
  font-size: 13px;
  text-align: center;
  line-height: 1.9;
}
.ddsc-msg {
  max-width: 88%;
  padding: 8px 11px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.ddsc-msg-user {
  align-self: flex-end;
  background: #3b62d9;
  color: #ffffff;
  border-bottom-right-radius: 3px;
}
.ddsc-msg-assistant {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #e5e8ee;
  border-bottom-left-radius: 3px;
}
.ddsc-quote-block {
  margin-bottom: 6px;
  padding: 6px 8px;
  border-left: 2px solid rgba(255, 255, 255, 0.55);
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ddsc-reasoning {
  margin-bottom: 6px;
  padding: 6px 8px;
  border-left: 2px solid #c3ccf5;
  color: #8f959e;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}
.ddsc-reasoning-label { font-size: 11px; color: #a6aab2; margin-bottom: 2px; }
.ddsc-msg-error {
  align-self: center;
  background: #fef0f0;
  border: 1px solid #f5c6c6;
  color: #c45656;
  font-size: 12px;
  max-width: 96%;
}
.ddsc-cursor::after {
  content: '▍';
  animation: ddsc-blink 0.9s steps(2) infinite;
  color: #3b62d9;
}
@keyframes ddsc-blink { 50% { opacity: 0; } }

/* ---------- composer ---------- */
.ddsc-composer-wrap {
  flex: none;
  background: #ffffff;
  border-top: 1px solid #e5e8ee;
}
.ddsc-quote-chip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 8px 12px 0;
  padding: 6px 8px;
  border: 1px solid #e5e8ee;
  border-left: 3px solid #3b62d9;
  border-radius: 6px;
  background: #f2f5ff;
}
.ddsc-quote-chip-text {
  flex: 1;
  font-size: 12px;
  color: #646a73;
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ddsc-quote-chip-x {
  border: none;
  background: transparent;
  color: #8f959e;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.4;
  flex: none;
}
.ddsc-quote-chip-x:hover { color: #c45656; }
.ddsc-composer {
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.ddsc-input {
  flex: 1;
  resize: none;
  border: 1px solid #d8dce3;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
  max-height: 120px;
  background: #ffffff;
  color: #1f2329;
  font-family: inherit;
  outline: none;
}
.ddsc-input:focus { border-color: #3b62d9; }
.ddsc-send {
  flex: none;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  background: #3b62d9;
  color: #ffffff;
}
.ddsc-send:disabled { background: #b9c2d8; cursor: not-allowed; }
.ddsc-send.ddsc-stop { background: #c45656; }

/* ---------- selection quote popover ---------- */
.ddsc-quote-pop {
  position: fixed;
  z-index: 950;
  transform: translate(-100%, -100%);
  border: none;
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 12px;
  background: #1f2329;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  user-select: none;
}
.ddsc-quote-pop:hover { background: #3b62d9; }

/* ---------- settings modal ---------- */
.ddsc-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ddsc-modal {
  width: 360px;
  max-width: 92vw;
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  color: #1f2329;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}
.ddsc-modal-title { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
.ddsc-section { margin-bottom: 16px; }
.ddsc-section-label { font-size: 12px; color: #8f959e; margin-bottom: 8px; }
.ddsc-model-option {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e8ee;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  cursor: pointer;
  font-size: 13px;
}
.ddsc-model-option:hover { border-color: #3b62d9; }
.ddsc-model-option.active { border-color: #3b62d9; background: #f2f5ff; }
.ddsc-model-desc { font-size: 11px; color: #8f959e; margin-left: auto; }
.ddsc-link-btn {
  display: inline-block;
  border: 1px solid #d8dce3;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  color: #3b62d9;
  background: #ffffff;
  cursor: pointer;
  text-decoration: none;
}
.ddsc-danger-btn {
  border: 1px solid #f5c6c6;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  color: #c45656;
  background: #fef0f0;
  cursor: pointer;
}
.ddsc-danger-btn:hover { background: #c45656; color: #ffffff; }
.ddsc-modal-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.ddsc-version { font-size: 11px; color: #a6aab2; }
.ddsc-close-btn {
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  background: #eef0f4;
  color: #1f2329;
  cursor: pointer;
}
.ddsc-hint { font-size: 12px; color: #8f959e; margin-top: 6px; line-height: 1.6; }
.ddsc-hint code {
  background: #eef0f4;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}

/* ---------- dark theme ---------- */
body[data-ds-dark-theme] .ddsc-entry { background: #1f2229; border-color: #3a3f4a; color: #7b9bff; }
body[data-ds-dark-theme] .ddsc-entry:hover { background: #4d6fd1; color: #ffffff; }
body[data-ds-dark-theme] .ddsc-window { background: #16181d; border-color: #2c313a; color: #d6d9df; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5); }
body[data-ds-dark-theme] .ddsc-titlebar { background: #1f2229; border-bottom-color: #2c313a; }
body[data-ds-dark-theme] .ddsc-select { background: #16181d; border-color: #3a3f4a; color: #d6d9df; }
body[data-ds-dark-theme] .ddsc-icon-btn { color: #9aa0ab; }
body[data-ds-dark-theme] .ddsc-icon-btn:hover { background: #2c313a; color: #d6d9df; }
body[data-ds-dark-theme] .ddsc-resize-handle {
  background: linear-gradient(135deg, transparent 0 55%, #4a505c 55% 60%, transparent 60% 70%, #4a505c 70% 75%, transparent 75% 85%, #4a505c 85% 90%, transparent 90%);
}
body[data-ds-dark-theme] .ddsc-resize-handle:hover {
  background: linear-gradient(135deg, transparent 0 55%, #7b9bff 55% 60%, transparent 60% 70%, #7b9bff 70% 75%, transparent 75% 85%, #7b9bff 85% 90%, transparent 90%);
}
body[data-ds-dark-theme] .ddsc-empty { color: #6b7280; }
body[data-ds-dark-theme] .ddsc-msg-assistant { background: #1f2229; border-color: #2c313a; }
body[data-ds-dark-theme] .ddsc-msg-user { background: #4d6fd1; }
body[data-ds-dark-theme] .ddsc-reasoning { border-left-color: #3d4a7a; color: #6b7280; }
body[data-ds-dark-theme] .ddsc-msg-error { background: #2c1d1f; border-color: #5a3236; color: #e08a8a; }
body[data-ds-dark-theme] .ddsc-composer-wrap { background: #1f2229; border-top-color: #2c313a; }
body[data-ds-dark-theme] .ddsc-quote-chip { background: #232a3d; border-color: #3a3f4a; border-left-color: #4d6fd1; }
body[data-ds-dark-theme] .ddsc-quote-chip-text { color: #9aa0ab; }
body[data-ds-dark-theme] .ddsc-input { background: #16181d; border-color: #3a3f4a; color: #d6d9df; }
body[data-ds-dark-theme] .ddsc-input:focus { border-color: #4d6fd1; }
body[data-ds-dark-theme] .ddsc-send { background: #4d6fd1; }
body[data-ds-dark-theme] .ddsc-send:disabled { background: #3a3f4a; }
body[data-ds-dark-theme] .ddsc-quote-pop { background: #e8eaf0; color: #1f2329; }
body[data-ds-dark-theme] .ddsc-quote-pop:hover { background: #4d6fd1; color: #ffffff; }
body[data-ds-dark-theme] .ddsc-modal { background: #1f2229; color: #d6d9df; }
body[data-ds-dark-theme] .ddsc-model-option { border-color: #3a3f4a; }
body[data-ds-dark-theme] .ddsc-model-option.active { border-color: #4d6fd1; background: #232a3d; }
body[data-ds-dark-theme] .ddsc-link-btn { background: #16181d; border-color: #3a3f4a; color: #7b9bff; }
body[data-ds-dark-theme] .ddsc-danger-btn { background: #2c1d1f; border-color: #5a3236; color: #e08a8a; }
body[data-ds-dark-theme] .ddsc-danger-btn:hover { background: #8a3a40; color: #ffffff; }
body[data-ds-dark-theme] .ddsc-close-btn { background: #2c313a; color: #d6d9df; }
body[data-ds-dark-theme] .ddsc-hint code { background: #2c313a; }
`

/** Inject the stylesheet once; returns nothing. Idempotent. */
export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin="${STYLE_TAG_ID}"]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = STYLE_TAG_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}

/** Remove the stylesheet (plugin unload). */
export function removeStyles(): void {
  document.querySelector(`style[data-plugin="${STYLE_TAG_ID}"]`)?.remove()
}

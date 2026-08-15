/**
 * Inline stylesheet for the browser half. Injected as one
 * <style data-plugin="dsh-ask-deepseek"> tag (the GUI removes plugin-owned
 * tags on unload; we remove it ourselves on dispose too).
 *
 * Light tokens are the default; `body[data-ds-dark-theme]` overrides mirror
 * the shell's dark marker, the same convention official UI plugins follow.
 * @module dsh-ask-deepseek/client/styles
 */

export const STYLE_TAG_ID = 'dsh-ask-deepseek'

export const CSS = `
/* ---------- floating entry ---------- */
.askds-entry {
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
.askds-entry:hover { background: #3b62d9; color: #ffffff; }

/* ---------- panel ---------- */
.askds-mask {
  position: fixed;
  inset: 0;
  z-index: 899;
  background: transparent;
}
.askds-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 92vw;
  z-index: 901;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  border-left: 1px solid #d8dce3;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  animation: askds-slide-in 0.18s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
  color: #1f2329;
}
@keyframes askds-slide-in {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ---------- header ---------- */
.askds-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e8ee;
  flex: none;
}
.askds-title { font-size: 14px; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.askds-select {
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid #d8dce3;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2329;
  max-width: 150px;
}
.askds-icon-btn {
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
.askds-icon-btn:hover { background: #eef0f4; color: #1f2329; }

/* ---------- messages ---------- */
.askds-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.askds-empty {
  margin: auto;
  color: #8f959e;
  font-size: 13px;
  text-align: center;
  line-height: 1.9;
}
.askds-msg {
  max-width: 88%;
  padding: 8px 11px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.askds-msg-user {
  align-self: flex-end;
  background: #3b62d9;
  color: #ffffff;
  border-bottom-right-radius: 3px;
}
.askds-msg-assistant {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #e5e8ee;
  border-bottom-left-radius: 3px;
}
.askds-reasoning {
  margin-bottom: 6px;
  padding: 6px 8px;
  border-left: 2px solid #c3ccf5;
  color: #8f959e;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}
.askds-reasoning-label { font-size: 11px; color: #a6aab2; margin-bottom: 2px; }
.askds-msg-error {
  align-self: center;
  background: #fef0f0;
  border: 1px solid #f5c6c6;
  color: #c45656;
  font-size: 12px;
  max-width: 96%;
}
.askds-usage { font-size: 11px; color: #a6aab2; align-self: flex-start; }
.askds-cursor::after {
  content: '▍';
  animation: askds-blink 0.9s steps(2) infinite;
  color: #3b62d9;
}
@keyframes askds-blink { 50% { opacity: 0; } }

/* ---------- composer ---------- */
.askds-composer {
  flex: none;
  padding: 10px 12px;
  background: #ffffff;
  border-top: 1px solid #e5e8ee;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.askds-input {
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
.askds-input:focus { border-color: #3b62d9; }
.askds-send {
  flex: none;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  background: #3b62d9;
  color: #ffffff;
}
.askds-send:disabled { background: #b9c2d8; cursor: not-allowed; }
.askds-send.askds-stop { background: #c45656; }

/* ---------- settings modal ---------- */
.askds-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.askds-modal {
  width: 360px;
  max-width: 92vw;
  background: #ffffff;
  border-radius: 12px;
  padding: 18px;
  color: #1f2329;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}
.askds-modal-title { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
.askds-section { margin-bottom: 16px; }
.askds-section-label { font-size: 12px; color: #8f959e; margin-bottom: 8px; }
.askds-model-option {
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
.askds-model-option:hover { border-color: #3b62d9; }
.askds-model-option.active { border-color: #3b62d9; background: #f2f5ff; }
.askds-model-desc { font-size: 11px; color: #8f959e; margin-left: auto; }
.askds-link-btn {
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
.askds-danger-btn {
  border: 1px solid #f5c6c6;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  color: #c45656;
  background: #fef0f0;
  cursor: pointer;
}
.askds-danger-btn:hover { background: #c45656; color: #ffffff; }
.askds-modal-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.askds-version { font-size: 11px; color: #a6aab2; }
.askds-close-btn {
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  background: #eef0f4;
  color: #1f2329;
  cursor: pointer;
}
.askds-hint { font-size: 12px; color: #8f959e; margin-top: 6px; line-height: 1.6; }
.askds-hint code {
  background: #eef0f4;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}

/* ---------- dark theme ---------- */
body[data-ds-dark-theme] .askds-entry { background: #1f2229; border-color: #3a3f4a; color: #7b9bff; }
body[data-ds-dark-theme] .askds-entry:hover { background: #4d6fd1; color: #ffffff; }
body[data-ds-dark-theme] .askds-panel { background: #16181d; border-left-color: #2c313a; color: #d6d9df; }
body[data-ds-dark-theme] .askds-header { background: #1f2229; border-bottom-color: #2c313a; }
body[data-ds-dark-theme] .askds-select { background: #16181d; border-color: #3a3f4a; color: #d6d9df; }
body[data-ds-dark-theme] .askds-icon-btn { color: #9aa0ab; }
body[data-ds-dark-theme] .askds-icon-btn:hover { background: #2c313a; color: #d6d9df; }
body[data-ds-dark-theme] .askds-empty { color: #6b7280; }
body[data-ds-dark-theme] .askds-msg-assistant { background: #1f2229; border-color: #2c313a; }
body[data-ds-dark-theme] .askds-msg-user { background: #4d6fd1; }
body[data-ds-dark-theme] .askds-reasoning { border-left-color: #3d4a7a; color: #6b7280; }
body[data-ds-dark-theme] .askds-msg-error { background: #2c1d1f; border-color: #5a3236; color: #e08a8a; }
body[data-ds-dark-theme] .askds-composer { background: #1f2229; border-top-color: #2c313a; }
body[data-ds-dark-theme] .askds-input { background: #16181d; border-color: #3a3f4a; color: #d6d9df; }
body[data-ds-dark-theme] .askds-input:focus { border-color: #4d6fd1; }
body[data-ds-dark-theme] .askds-send { background: #4d6fd1; }
body[data-ds-dark-theme] .askds-send:disabled { background: #3a3f4a; }
body[data-ds-dark-theme] .askds-modal { background: #1f2229; color: #d6d9df; }
body[data-ds-dark-theme] .askds-model-option { border-color: #3a3f4a; }
body[data-ds-dark-theme] .askds-model-option.active { border-color: #4d6fd1; background: #232a3d; }
body[data-ds-dark-theme] .askds-link-btn { background: #16181d; border-color: #3a3f4a; color: #7b9bff; }
body[data-ds-dark-theme] .askds-danger-btn { background: #2c1d1f; border-color: #5a3236; color: #e08a8a; }
body[data-ds-dark-theme] .askds-danger-btn:hover { background: #8a3a40; color: #ffffff; }
body[data-ds-dark-theme] .askds-close-btn { background: #2c313a; color: #d6d9df; }
body[data-ds-dark-theme] .askds-hint code { background: #2c313a; }
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

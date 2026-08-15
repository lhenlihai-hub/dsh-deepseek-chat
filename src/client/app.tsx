/**
 * dsh-deepseek-chat — browser UI: the floating「问 DeepSeek」entry, the
 * right-side chat panel (fresh conversation, flash/pro model switch) and the
 * settings modal (default model, feedback, uninstall).
 *
 * Talks to the host half over /deepseek-chat/* with SSE streaming. Chat
 * history lives in component state only — opening the panel always starts a
 * conversation independent of the dsh agent session.
 * @module dsh-deepseek-chat/client/app
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// Replace with your GitHub repository before publishing.
const ISSUES_URL = 'https://github.com/lhenlihai-hub/dsh-deepseek-chat/issues'
const VERSION = '0.1.0'
const MODEL_STORAGE_KEY = 'dsh-deepseek-chat:model'
const FALLBACK_MODEL = 'deepseek-v4-flash'

interface ModelInfo {
  id: string
  name: string
  description?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  reasoning?: string
}

type PanelError = string | null

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function fetchModels(): Promise<ModelInfo[]> {
  const res = await fetch('/deepseek-chat/models')
  const body = (await res.json()) as { ok: boolean; value?: { models?: ModelInfo[] }; error?: { message?: string } }
  if (!body.ok) throw new Error(body.error?.message ?? '模型列表获取失败')
  return body.value?.models ?? []
}

interface StreamHandlers {
  onText: (text: string) => void
  onReasoning: (text: string) => void
  onError: (message: string) => void
  onDone: () => void
}

/** POST the conversation and consume the SSE stream back from the host. */
async function streamChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  signal: AbortSignal,
  handlers: StreamHandlers,
): Promise<void> {
  const res = await fetch('/deepseek-chat/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages }),
    signal,
  })
  if (!res.ok || res.body === null) {
    handlers.onError(`请求失败(HTTP ${res.status})`)
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data: '))
      if (line === undefined) continue
      try {
        const event = JSON.parse(line.slice(6)) as { type: string; text?: string; message?: string }
        if (event.type === 'text' && typeof event.text === 'string') handlers.onText(event.text)
        else if (event.type === 'reasoning' && typeof event.text === 'string') handlers.onReasoning(event.text)
        else if (event.type === 'error') handlers.onError(event.message ?? '未知错误')
        else if (event.type === 'finish' || event.type === 'done') handlers.onDone()
      } catch {
        // Incomplete JSON frame — ignore, the next chunk completes it.
      }
    }
  }
  handlers.onDone()
}

async function requestUninstall(): Promise<void> {
  const res = await fetch('/deepseek-chat/uninstall', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  const body = (await res.json()) as { ok: boolean; error?: { message?: string } }
  if (!body.ok) throw new Error(body.error?.message ?? '卸载失败')
}

// ---------------------------------------------------------------------------
// Settings modal
// ---------------------------------------------------------------------------

interface SettingsProps {
  models: ModelInfo[]
  model: string
  onModelChange: (id: string) => void
  onClose: () => void
}

function SettingsModal(props: SettingsProps): React.JSX.Element {
  const [confirming, setConfirming] = useState(false)
  const [uninstalled, setUninstalled] = useState(false)
  const [uninstallError, setUninstallError] = useState<string | null>(null)

  const uninstall = async (): Promise<void> => {
    try {
      await requestUninstall()
      setUninstalled(true)
    } catch (error) {
      setUninstallError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="ddsc-modal-mask" onClick={props.onClose}>
      <div className="ddsc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ddsc-modal-title">问 DeepSeek · 设置</div>

        <div className="ddsc-section">
          <div className="ddsc-section-label">默认模型</div>
          {props.models.map((m) => (
            <div
              key={m.id}
              className={`ddsc-model-option${props.model === m.id ? ' active' : ''}`}
              onClick={() => props.onModelChange(m.id)}
            >
              <span>{m.name}</span>
              <span className="ddsc-model-desc">{m.id.includes('flash') ? '更快' : '更强'}</span>
            </div>
          ))}
        </div>

        <div className="ddsc-section">
          <div className="ddsc-section-label">意见反馈</div>
          <a className="ddsc-link-btn" href={ISSUES_URL} target="_blank" rel="noreferrer">
            去 GitHub Issues 提意见
          </a>
        </div>

        <div className="ddsc-section">
          <div className="ddsc-section-label">卸载插件</div>
          {uninstalled ? (
            <div className="ddsc-hint">插件已卸载,重启 <code>dsh web</code> 后生效。</div>
          ) : confirming ? (
            <>
              <button className="ddsc-danger-btn" onClick={() => void uninstall()}>确认卸载 dsh-deepseek-chat</button>
              <div className="ddsc-hint">
                也可以在终端执行 <code>dsh plugin --profile web remove dsh-deepseek-chat</code>
              </div>
              {uninstallError !== null && <div className="ddsc-hint">卸载失败:{uninstallError}</div>}
            </>
          ) : (
            <button className="ddsc-danger-btn" onClick={() => setConfirming(true)}>卸载本插件…</button>
          )}
        </div>

        <div className="ddsc-modal-foot">
          <span className="ddsc-version">v{VERSION}</span>
          <button className="ddsc-close-btn" onClick={props.onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------

export function App(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [models, setModels] = useState<ModelInfo[]>([
    { id: 'deepseek-v4-flash', name: 'DeepSeek-V4-Flash' },
    { id: 'deepseek-v4-pro', name: 'DeepSeek-V4-Pro' },
  ])
  const [model, setModel] = useState<string>(() => {
    try {
      return localStorage.getItem(MODEL_STORAGE_KEY) ?? FALLBACK_MODEL
    } catch {
      return FALLBACK_MODEL
    }
  })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [panelError, setPanelError] = useState<PanelError>(null)

  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Refresh the model catalog from the host whenever the panel opens.
  useEffect(() => {
    if (!open) return
    let stale = false
    fetchModels()
      .then((list) => {
        if (stale || list.length === 0) return
        setModels(list)
        setModel((prev) => (list.some((m) => m.id === prev) ? prev : list[0].id))
        setPanelError(null)
      })
      .catch((error: unknown) => {
        if (!stale) setPanelError(error instanceof Error ? error.message : String(error))
      })
    return () => {
      stale = true
    }
  }, [open])

  // Keep the message list pinned to the bottom while streaming.
  useEffect(() => {
    const el = listRef.current
    if (el !== null) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  const pickModel = useCallback((id: string) => {
    setModel(id)
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, id)
    } catch {
      // localStorage unavailable — the session value still applies.
    }
  }, [])

  const patchLastAssistant = useCallback((patch: (msg: ChatMessage) => ChatMessage) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      next[next.length - 1] = patch(next[next.length - 1])
      return next
    })
  }, [])

  const send = useCallback(async (): Promise<void> => {
    const text = input.trim()
    if (text === '' || streaming) return
    setInput('')
    setPanelError(null)

    const history: ChatMessage[] = [...messages, { role: 'user', text }]
    const withAssistant: ChatMessage[] = [...history, { role: 'assistant', text: '' }]
    setMessages(withAssistant)
    setStreaming(true)

    const abort = new AbortController()
    abortRef.current = abort

    const wire = history.map((m) => ({ role: m.role, content: m.text }))
    try {
      await streamChat(model, wire, abort.signal, {
        onText: (delta) => patchLastAssistant((m) => ({ ...m, text: m.text + delta })),
        onReasoning: (delta) => patchLastAssistant((m) => ({ ...m, reasoning: (m.reasoning ?? '') + delta })),
        onError: (message) => {
          setPanelError(message)
          patchLastAssistant((m) => m)
        },
        onDone: () => undefined,
      })
    } catch (error) {
      if (!abort.signal.aborted) {
        setPanelError(error instanceof Error ? error.message : String(error))
      }
    } finally {
      // A never-answered assistant placeholder is dropped instead of left blank.
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last !== undefined && last.role === 'assistant' && last.text === '' && (last.reasoning ?? '') === '') {
          return prev.slice(0, -1)
        }
        return prev
      })
      setStreaming(false)
      abortRef.current = null
    }
  }, [input, streaming, messages, model, patchLastAssistant])

  const stop = useCallback((): void => {
    abortRef.current?.abort()
  }, [])

  const newChat = useCallback((): void => {
    abortRef.current?.abort()
    setMessages([])
    setPanelError(null)
  }, [])

  return (
    <>
      {!open && (
        <button className="ddsc-entry" onClick={() => setOpen(true)} title="问 DeepSeek">
          问 DeepSeek
        </button>
      )}

      {open && (
        <>
          <div className="ddsc-mask" onClick={() => setOpen(false)} />
          <div className="ddsc-panel">
            <div className="ddsc-header">
              <span className="ddsc-title">问 DeepSeek</span>
              <select
                className="ddsc-select"
                value={model}
                onChange={(e) => pickModel(e.target.value)}
                disabled={streaming}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <button className="ddsc-icon-btn" title="新对话" onClick={newChat}>✚</button>
              <button className="ddsc-icon-btn" title="设置" onClick={() => setSettingsOpen(true)}>⚙</button>
              <button className="ddsc-icon-btn" title="收起" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="ddsc-messages" ref={listRef}>
              {messages.length === 0 && (
                <div className="ddsc-empty">
                  与 DeepSeek 开始一段全新对话
                  <br />
                  使用你在 dsh 中配置的 API Key,独立会话、互不影响
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`ddsc-msg ${m.role === 'user' ? 'ddsc-msg-user' : 'ddsc-msg-assistant'}`}>
                  {m.reasoning !== undefined && m.reasoning !== '' && (
                    <div className="ddsc-reasoning">
                      <div className="ddsc-reasoning-label">思考过程</div>
                      {m.reasoning}
                    </div>
                  )}
                  <span className={streaming && i === messages.length - 1 && m.role === 'assistant' ? 'ddsc-cursor' : undefined}>
                    {m.text}
                  </span>
                </div>
              ))}
              {panelError !== null && <div className="ddsc-msg ddsc-msg-error">{panelError}</div>}
            </div>

            <div className="ddsc-composer">
              <textarea
                className="ddsc-input"
                rows={2}
                placeholder="输入消息,Enter 发送,Shift+Enter 换行"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    void send()
                  }
                }}
              />
              {streaming ? (
                <button className="ddsc-send ddsc-stop" onClick={stop}>停止</button>
              ) : (
                <button className="ddsc-send" onClick={() => void send()} disabled={input.trim() === ''}>发送</button>
              )}
            </div>
          </div>
        </>
      )}

      {settingsOpen && (
        <SettingsModal
          models={models}
          model={model}
          onModelChange={pickModel}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  )
}

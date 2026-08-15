/**
 * dsh-deepseek-chat — host half: the /deepseek-chat/* HTTP routes on the shared
 * webserver. Chat requests stream through the harness LLM seam (`ctx.llm`),
 * reusing the provider route the user already configured in dsh
 * (Settings → Models) — API key, base URL and settings overrides all apply.
 * Nothing is proxied to a hardcoded endpoint and no key is handled here.
 *
 * The browser half (exports "./client") is served by client-modules from the
 * same package's dsh.client declaration.
 * @module dsh-deepseek-chat
 */

import { spawn } from 'node:child_process'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'

/** Required services: the route registry and the LLM seam. */
export const inject = ['webServer', 'llm']

/** npm package name — the row `dsh plugin remove` uninstalls. */
const PACKAGE_NAME = 'dsh-deepseek-chat'

/** Preferred provider route; falls back to any route whose id mentions deepseek. */
const PREFERRED_PROVIDER = 'deepseek-official'

/** Advertised when the provider catalog is empty (adapter pass-through ids). */
const DEFAULT_MODELS = [
  { id: 'deepseek-v4-flash', name: 'DeepSeek-V4-Flash' },
  { id: 'deepseek-v4-pro', name: 'DeepSeek-V4-Pro' },
] as const

const BODY_LIMIT = 4 * 1024 * 1024

// ---------------------------------------------------------------------------
// Minimal structural typings for the two consumed services. The real types
// live in @deepseek-ai/dsh-host-webserver and @deepseek-ai/dsh-llm; declaring
// the consumed surface locally keeps the plugin buildable against any rc.
// ---------------------------------------------------------------------------

interface WebServerLike {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

interface LlmProviderInfoLike {
  id: string
  name: string
}

interface LlmModelInfoLike {
  id: string
  name: string
  description?: string
}

interface StreamChunkLike {
  type: string
  text?: string
  usage?: unknown
  reason?: { kind: string; failure?: { code?: string; message?: string } }
}

interface LlmLike {
  listProviders(): LlmProviderInfoLike[]
  listModels(provider: string): Promise<LlmModelInfoLike[]>
  stream(options: Record<string, unknown>): AsyncIterable<StreamChunkLike>
}

// ---------------------------------------------------------------------------
// HTTP helpers (loopback fence + JSON envelope, same posture as official UI
// plugins: business errors stay HTTP 200 inside the envelope).
// ---------------------------------------------------------------------------

type Envelope = { ok: true; value: unknown } | { ok: false; error: { code: string; message: string } }

const OK = (value: unknown): Envelope => ({ ok: true, value })
const FAIL = (code: string, message: string): Envelope => ({ ok: false, error: { code, message } })

function json(res: ServerResponse, envelope: Envelope, status = 200): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(envelope))
}

/** Loopback fence: the panel is served by the same machine, anything else is refused. */
function isLoopback(req: IncomingMessage): boolean {
  const addr = req.socket.remoteAddress ?? ''
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1'
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = chunk as Buffer
    size += buf.length
    if (size > BODY_LIMIT) return null
    chunks.push(buf)
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function sse(res: ServerResponse, event: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

// ---------------------------------------------------------------------------
// LLM seam access
// ---------------------------------------------------------------------------

/** Resolve the DeepSeek provider route the deployment already registered. */
function resolveProvider(llm: LlmLike): string | null {
  const providers = llm.listProviders()
  if (providers.some((p) => p.id === PREFERRED_PROVIDER)) return PREFERRED_PROVIDER
  const fallback = providers.find((p) => p.id.toLowerCase().includes('deepseek'))
  return fallback === undefined ? null : fallback.id
}

interface WireMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Validate and normalize the client payload. Returns null on malformed input. */
function parseMessages(payload: Record<string, unknown>): { model: string; messages: WireMessage[] } | null {
  const model = payload.model
  if (typeof model !== 'string' || model.trim() === '') return null
  const raw = payload.messages
  if (!Array.isArray(raw) || raw.length === 0) return null
  const messages: WireMessage[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return null
    const { role, content } = item as Record<string, unknown>
    if (role !== 'user' && role !== 'assistant' && role !== 'system') return null
    if (typeof content !== 'string' || content === '') return null
    messages.push({ role, content })
  }
  return { model: model.trim(), messages }
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

async function handleModels(ctx: Context, req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!isLoopback(req)) {
    json(res, FAIL('forbidden', 'loopback-only'), 403)
    return
  }
  if (req.method !== 'GET') {
    json(res, FAIL('method-not-allowed', 'GET only'), 405)
    return
  }
  const llm = (ctx as unknown as { llm: LlmLike }).llm
  const provider = resolveProvider(llm)
  if (provider === null) {
    json(res, FAIL('NO_DEEPSEEK_PROVIDER', '未找到 DeepSeek 模型路由,请先在 dsh 设置 → 模型 中配置 DeepSeek API Key'))
    return
  }
  try {
    const catalog = await llm.listModels(provider)
    json(res, OK({
      provider,
      models: catalog.length > 0
        ? catalog.map((m) => ({ id: m.id, name: m.name, description: m.description }))
        : [...DEFAULT_MODELS],
    }))
  } catch {
    // The catalog is advisory; fall back to the adapter's pass-through defaults.
    json(res, OK({ provider, models: [...DEFAULT_MODELS] }))
  }
}

async function handleChat(ctx: Context, req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!isLoopback(req)) {
    json(res, FAIL('forbidden', 'loopback-only'), 403)
    return
  }
  if (req.method !== 'POST') {
    json(res, FAIL('method-not-allowed', 'POST only'), 405)
    return
  }
  const contentType = req.headers['content-type'] ?? ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    json(res, FAIL('bad-request', 'application/json required'), 415)
    return
  }
  const payload = await readJsonBody(req)
  const parsed = payload === null ? null : parseMessages(payload)
  if (parsed === null) {
    json(res, FAIL('bad-request', 'malformed request: { model, messages: [{role, content}] }'), 400)
    return
  }

  const llm = (ctx as unknown as { llm: LlmLike }).llm
  const provider = resolveProvider(llm)

  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  })
  res.write('retry: 2000\n\n')

  if (provider === null) {
    sse(res, { type: 'error', code: 'NO_DEEPSEEK_PROVIDER', message: '未找到 DeepSeek 模型路由,请先在 dsh 设置 → 模型 中配置 DeepSeek API Key' })
    res.end()
    return
  }

  // Cooperative cancellation: closing the browser connection aborts the stream.
  const abort = new AbortController()
  req.on('close', () => abort.abort())

  // Map the plain wire messages onto the harness LLM seam vocabulary.
  const messages = parsed.messages.map((m, i) => ({
    id: `deepseek-chat-${Date.now()}-${i}`,
    role: m.role,
    content: [{ type: 'text', text: m.content }],
    source: m.role === 'user' ? { kind: 'user' } : m.role === 'system' ? { kind: 'plugin', plugin: PACKAGE_NAME } : { kind: 'model' },
  }))

  try {
    const stream = llm.stream({
      provider,
      model: parsed.model,
      messages,
      signal: abort.signal,
    })
    for await (const chunk of stream) {
      if (chunk.type === 'text-delta' && typeof chunk.text === 'string') {
        sse(res, { type: 'text', text: chunk.text })
      } else if (chunk.type === 'reasoning-delta' && typeof chunk.text === 'string') {
        sse(res, { type: 'reasoning', text: chunk.text })
      } else if (chunk.type === 'usage') {
        sse(res, { type: 'usage', usage: chunk.usage })
      } else if (chunk.type === 'finish') {
        const kind = chunk.reason?.kind ?? 'stop'
        if (kind === 'error' || kind === 'aborted') {
          sse(res, { type: 'error', code: chunk.reason?.failure?.code ?? kind, message: chunk.reason?.failure?.message ?? '请求未完成' })
        } else {
          sse(res, { type: 'finish', reason: kind })
        }
      }
    }
    sse(res, { type: 'done' })
  } catch (error) {
    if (!abort.signal.aborted) {
      sse(res, { type: 'error', code: 'INTERNAL', message: error instanceof Error ? error.message : String(error) })
    }
  } finally {
    res.end()
  }
}

/**
 * Uninstall this plugin on explicit user request (the settings modal runs a
 * two-step confirm). Removal lands in the profile; a `dsh web` restart
 * applies it. Loopback-only, and the target package is hardcoded to ourselves.
 */
async function handleUninstall(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!isLoopback(req)) {
    json(res, FAIL('forbidden', 'loopback-only'), 403)
    return
  }
  if (req.method !== 'POST') {
    json(res, FAIL('method-not-allowed', 'POST only'), 405)
    return
  }
  try {
    const child = spawn('dsh', ['plugin', '--profile', 'web', 'remove', PACKAGE_NAME], {
      detached: true,
      stdio: 'ignore',
      shell: true,
    })
    child.unref()
    json(res, OK({ removed: PACKAGE_NAME, restartRequired: true }))
  } catch (error) {
    json(res, FAIL('UNINSTALL_FAILED', error instanceof Error ? error.message : String(error)))
  }
}

// ---------------------------------------------------------------------------
// Plugin entry
// ---------------------------------------------------------------------------

export function apply(ctx: Context): void {
  const webServer = (ctx as unknown as { webServer: WebServerLike }).webServer
  ctx.effect(() => {
    const disposers = [
      webServer.register({ kind: 'exact', path: '/deepseek-chat/models', handler: (req, res) => handleModels(ctx, req, res) }),
      webServer.register({ kind: 'exact', path: '/deepseek-chat/chat', handler: (req, res) => handleChat(ctx, req, res) }),
      webServer.register({ kind: 'exact', path: '/deepseek-chat/uninstall', handler: handleUninstall }),
    ]
    return () => {
      for (const dispose of disposers) dispose()
    }
  }, 'dsh-deepseek-chat: /deepseek-chat routes')
}

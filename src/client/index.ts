/**
 * dsh-ask-deepseek — browser half entry. Mounts the「问 DeepSeek」React root
 * into document.body. React / react-dom resolve through the shell's frozen
 * module table (they are bundle externals); the stylesheet is one inline
 * <style data-plugin> tag.
 *
 * Failure policy: mounting failures are logged, never thrown — the web shell
 * fails the whole boot when a plugin apply throws.
 * @module dsh-ask-deepseek/client
 */

import type { Context } from '@deepseek-ai/cordis'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './app.tsx'
import { injectStyles, removeStyles } from './styles.ts'

/** No shell services are required — the panel talks to its own host routes. */
export const inject: string[] = []

const HOST_ID = 'dsh-ask-deepseek-root'

export function apply(ctx: Context): void {
  ctx.effect(() => {
    injectStyles()
    const host = document.createElement('div')
    host.id = HOST_ID
    document.body.appendChild(host)
    let root: Root | undefined
    try {
      root = createRoot(host)
      root.render(createElement(App))
    } catch (error) {
      console.error('[dsh-ask-deepseek] mount failed:', error)
    }
    return () => {
      try {
        root?.unmount()
      } catch {
        // Already torn down by the shell.
      }
      host.remove()
      removeStyles()
    }
  }, 'dsh-ask-deepseek: mount')
}

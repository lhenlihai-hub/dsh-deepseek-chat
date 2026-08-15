/**
 * Standalone build config for the dsh-deepseek-chat plugin.
 *
 * Two artifacts:
 * - lib/index.js  — node half (host routes), ESM, all @deepseek-ai/* external
 * - lib/client.js — browser half, a closure-factory CJS artifact that hands
 *   itself to the GUI via window.__ModuleLoader__.load({ id, factory }).
 *   Platform modules (react, react-dom, ...) stay external and are resolved
 *   through the shell's frozen module table by the injected require.
 */
import type { UserConfig } from 'tsdown'

const ID = 'dsh-deepseek-chat'

/** Module specifiers the dsh web shell shares into the frozen module table. */
const CLIENT_EXTERNALS: readonly string[] = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-schema-form',
  '@deepseek-ai/dsh-client-runtime/client',
]

const nodeHalf: UserConfig = {
  name: ID,
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: true,
  // The cordis framework and every dsh host service resolve at runtime from
  // the dsh profile tree, never from this package's own node_modules.
  external: [/^@deepseek-ai\//, /^node:/],
}

const browserHalf: UserConfig = {
  name: `${ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: true,
  // clean must stay off — a default clean would wipe the node-half output
  // emitted above into the same lib/ directory.
  clean: false,
  external: [...CLIENT_EXTERNALS],
  // Anything NOT in the loader module table must inline: a require() the
  // table cannot answer is a guaranteed runtime throw.
  noExternal: (id: string) => (CLIENT_EXTERNALS.includes(id) ? undefined : true),
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default [nodeHalf, browserHalf]

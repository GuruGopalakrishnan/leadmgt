import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

await build({
  entryPoints: [path.join(root, 'netlify-src', 'api.mjs')],
  outfile: path.join(root, 'netlify', 'functions', 'api.cjs'),
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  logLevel: 'info',
  // Optional native addons `ws` tries for a perf boost; not installed,
  // and `ws` falls back to pure JS without them at runtime.
  external: ['bufferutil', 'utf-8-validate'],
})

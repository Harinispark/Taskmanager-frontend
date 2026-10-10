/**
 * Workaround for npm's optional-dependencies bug (npm/cli#4828): native platform
 * bindings are recorded in the lockfile but never actually extracted on Windows.
 * After every `npm install`, verify the binding for each native tool can be
 * required and, when missing, download the exact matching version and extract it.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const root = process.cwd()

// Native host package -> the platform binding npm often fails to install.
const BINDINGS = [
  { host: 'oxlint', name: '@oxlint/binding-win32-x64-msvc' },
]

function hostVersion(name) {
  const manifestPath = join(root, 'node_modules', name, 'package.json')
  if (!existsSync(manifestPath)) return null
  return JSON.parse(readFileSync(manifestPath, 'utf8')).version
}

function extractBinding(pkg, version) {
  const target = join(root, 'node_modules', pkg)
  const tarName = `${pkg.slice(1).replace('/', '-')}-${version}.tgz`
  const workingDir = join(tmpdir(), 'task-manager-bindings')
  mkdirSync(workingDir, { recursive: true })

  execSync(`npm pack ${pkg}@${version} --pack-destination "${workingDir}"`, {
    cwd: root,
    stdio: 'ignore',
  })

  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  execSync(`tar -xzf "${join(workingDir, tarName)}" --strip-components=1 -C "${target}"`, {
    stdio: 'ignore',
  })
  console.log(`[postinstall] Installed missing binding ${pkg}@${version}`)
}

for (const { host, name } of BINDINGS) {
  const version = hostVersion(host)
  if (version === null) continue
  try {
    require(name)
  } catch {
    extractBinding(name, version)
  }
}
// scripts/check-and-commit.js
import fs from 'fs/promises'
import { execSync } from 'child_process'
const OUT = 'docs/status.json'
const KEEP_MS = 24 * 60 * 60 * 1000  // 最近 24 小时
const SERVICES = [
  { id: 'site', name: 'transyouth.xyz', url: 'https://transyouth.xyz' },
]

// helper
const now = () => new Date().toISOString()
const epoch = () => Date.now()

async function loadExisting() {
  try {
    const raw = await fs.readFile(OUT, 'utf8')
    return JSON.parse(raw)
  } catch {
    // init structure
    return {
      updatedAt: null,
      services: SERVICES.map(s => ({ id: s.id, name: s.name, url: s.url, history: [] }))
    }
  }
}

async function save(obj) {
  await fs.mkdir('docs', { recursive: true })
  await fs.writeFile(OUT, JSON.stringify(obj, null, 2), 'utf8')
}

async function checkUrl(url, timeout = 8000) {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    const res = await fetch(url, { method: 'GET', signal: controller.signal })
    clearTimeout(id)
    const rtt = Date.now() - start
    return { ok: res.ok, status: res.status, rtt, note: res.ok ? 'OK' : `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, status: null, rtt: null, note: err.name === 'AbortError' ? 'timeout' : (err.message || 'error') }
  }
}

function pruneHistory(hist) {
  const cutoff = epoch() - KEEP_MS
  return hist.filter(h => (new Date(h.ts)).getTime() >= cutoff)
}

function deepEqual(a,b){ return JSON.stringify(a)===JSON.stringify(b) }

async function run() {
  const state = await loadExisting()
  for (const s of SERVICES) {
    const res = await checkUrl(s.url)
    const row = {
      ts: now(),
      status: res.ok ? 'ok' : (res.status ? 'degraded' : 'down'),
      http: res.status,
      rtt: res.rtt,
      note: res.note
    }
    // find service in state
    let svc = state.services.find(x => x.id === s.id)
    if (!svc) {
      svc = { id: s.id, name: s.name, url: s.url, history: [] }
      state.services.push(svc)
    }
    svc.history = pruneHistory([ ...svc.history, row ])
  }
  state.updatedAt = now()

  // compare to existing on disk to avoid unnecessary commits
  let existingRaw = ''
  try { existingRaw = await fs.readFile(OUT, 'utf8') } catch(e){}
  const newRaw = JSON.stringify(state, null, 2)
  if (existingRaw !== newRaw) {
    await save(state)
    try {
      execSync('git config user.name "github-actions[bot]"')
      execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"')
      execSync('git add docs/status.json')
      execSync('git commit -m "chore(status): update status.json [skip ci]"', { stdio: 'inherit' })
      // push back to the same branch
      execSync('git push', { stdio: 'inherit' })
      console.log('Committed status.json')
    } catch (e) {
      console.log('git commit/push skipped (maybe no changes or permission):', e.message)
    }
  } else {
    console.log('No change to status.json - skip commit')
  }
}

run().catch(err => { console.error(err); process.exit(1) })
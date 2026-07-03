#!/usr/bin/env node
/**
 * Email newsletter subscribers about a published article via a Resend Broadcast.
 *
 *   node scripts/announce-article.mjs [slug] [--send]
 *
 * - No slug → the newest article by date.
 * - Default is a DRY RUN (creates nothing, just prints). Pass --send to actually
 *   create the broadcast and send it to the whole audience.
 *
 * Needs RESEND_API_KEY and RESEND_AUDIENCE_ID (read from env or .env.local).
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = path.resolve(process.cwd())
const CONTENT_DIR = path.join(ROOT, 'content')
const FROM = 'Systems & Signals <hello@syssignals.com>'
const BASE = 'https://syssignals.com'

// --- load env (process.env wins; fall back to .env.local) --------------------
function loadEnv() {
  const env = { ...process.env }
  const f = path.join(ROOT, '.env.local')
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !env[m[1]]) env[m[1]] = m[2]
    }
  }
  return env
}

function listArticles() {
  const out = []
  const walk = dir => {
    if (!fs.existsSync(dir)) return
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.mdx?$/.test(e.name)) {
        const { data } = matter(fs.readFileSync(p, 'utf-8'))
        out.push({
          slug: e.name.replace(/\.mdx?$/, ''),
          title: data.title ?? '',
          day: data.day,
          date: data.date ? String(data.date) : '',
          excerpt: data.excerpt ?? '',
          series: data.series ?? '',
        })
      }
    }
  }
  walk(CONTENT_DIR)
  return out
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function emailHtml(a, url) {
  const kicker = a.series ? `${esc(a.series)}${a.day ? ` · Day ${a.day}` : ''}` : 'New article'
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#07090e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07090e;padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0c1016;border:1px solid #1c2533;border-radius:14px;padding:36px;">
      <tr><td style="font-size:16px;font-weight:700;color:#e8edf4;padding-bottom:20px;">systems<span style="color:#22d3ee;">&amp;</span>signals</td></tr>
      <tr><td style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#22d3ee;padding-bottom:8px;">${kicker}</td></tr>
      <tr><td style="font-size:22px;font-weight:700;line-height:1.25;color:#e8edf4;padding-bottom:14px;">${esc(a.title)}</td></tr>
      <tr><td style="font-size:14px;line-height:1.65;color:#94a3b8;padding-bottom:26px;">${esc(a.excerpt)}</td></tr>
      <tr><td style="padding-bottom:26px;"><a href="${url}" style="display:inline-block;background:#22d3ee;color:#07090e;font-size:15px;font-weight:600;text-decoration:none;padding:12px 30px;border-radius:10px;">Read the article →</a></td></tr>
      <tr><td style="font-size:12px;line-height:1.6;color:#5d6b7e;border-top:1px solid #1c2533;padding-top:20px;">
        You're getting this because you subscribed at syssignals.com.
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#5d6b7e;text-decoration:underline;">Unsubscribe</a>.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}

async function waitLive(url, maxMs = 360000) {
  const started = Date.now()
  process.stdout.write('   waiting for the article to be live')
  while (Date.now() - started < maxMs) {
    try {
      const r = await fetch(url, { method: 'HEAD' })
      if (r.status === 200) { process.stdout.write(' live!\n'); return true }
    } catch {}
    process.stdout.write('.')
    await new Promise(r => setTimeout(r, 15000))
  }
  process.stdout.write(' timed out\n')
  return false
}

async function main() {
  const args = process.argv.slice(2)
  const send = args.includes('--send')
  const wait = args.includes('--wait')
  const slugArg = args.find(a => !a.startsWith('--'))

  const env = loadEnv()
  const KEY = env.RESEND_API_KEY
  const AUD = env.RESEND_AUDIENCE_ID
  if (!KEY || !AUD) {
    console.error('Missing RESEND_API_KEY or RESEND_AUDIENCE_ID — cannot announce.')
    process.exit(1)
  }

  const articles = listArticles()
  const article = slugArg
    ? articles.find(a => a.slug === slugArg)
    : articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.day ?? 0) - (a.day ?? 0)))[0]

  if (!article) {
    console.error(`Article not found${slugArg ? `: ${slugArg}` : ''}.`)
    process.exit(1)
  }

  const url = `${BASE}/articles/${article.slug}`
  const subject = `${article.series ? `${article.series} · Day ${article.day}` : 'New'} — ${article.title}`
  console.log(`Article: ${article.slug}`)
  console.log(`Subject: ${subject}`)
  console.log(`Link:    ${url}`)

  if (!send) {
    console.log('\n(dry run — pass --send to email the audience)')
    return
  }

  if (wait) {
    const ok = await waitLive(url)
    if (!ok) {
      console.error('Article never went live — skipping the email. Re-run manually once it is up:')
      console.error(`   npm run announce -- ${article.slug} --send`)
      process.exit(1)
    }
  }

  // 1) create broadcast
  const create = await fetch('https://api.resend.com/broadcasts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audience_id: AUD,
      from: FROM,
      subject,
      html: emailHtml(article, url),
      name: `${article.slug} announcement`,
    }),
  })
  const created = await create.json()
  if (!create.ok || !created.id) {
    console.error('Failed to create broadcast:', JSON.stringify(created))
    process.exit(1)
  }
  // 2) send it
  const sent = await fetch(`https://api.resend.com/broadcasts/${created.id}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!sent.ok) {
    console.error('Broadcast created but send failed:', await sent.text())
    process.exit(1)
  }
  console.log(`\n✓ Broadcast ${created.id} sent to the audience.`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

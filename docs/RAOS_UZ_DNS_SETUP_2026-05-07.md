# raos.uz DNS Setup — Railway Custom Domain (2026-05-07)

> Status: BLOCKED — Cloudflare account mismatch
> Owner: Bekzod (Tezcode CEO)

## Goal
Connect `raos.uz` and `www.raos.uz` to Railway production (`web-production-5b0b7.up.railway.app`) with HTTPS.

## Discovery Summary

### Railway side (READY)
- Project ID: `c984191a-3115-4574-968d-ae3aff3e4e80`
- Service: `web` (`4ff3300a-76e3-491f-bf08-22ccfa0321ef`)
- Service hostname: `web-production-5b0b7.up.railway.app`

### Required DNS records (from Railway GraphQL API)

| Host | Type | Required Target | Status |
|------|------|----------------|--------|
| `raos.uz` (apex) | CNAME | `a6lykzmu.up.railway.app` | REQUIRES_UPDATE |
| `www.raos.uz` | CNAME | `a08vf6v9.up.railway.app` | PROPAGATED ✅ |

### Authoritative DNS
- ahost.uz registers `raos.uz` but delegates DNS to Cloudflare
- Nameservers: `keira.ns.cloudflare.com`, `wesley.ns.cloudflare.com`
- DNS records MUST be edited in Cloudflare, not ahost

### Blocker
- `Bekzodmirzaaliyev27@gmail.com` Cloudflare account has 0 domains
- raos.uz lives in a different (unknown) Cloudflare account

## Resolution paths

### A) Locate correct Cloudflare account (recommended)
Add CNAME at apex pointing to `a6lykzmu.up.railway.app` (5-min change, Cloudflare flattens).

### B) Switch nameservers to ahost
1. ahost.uz → raos.uz → Name-серверa → "Стандартные неймсерверы"
2. Save → 24h propagation
3. ahost DNS-хостинг → CNAME @ → `a6lykzmu.up.railway.app` (verify ahost supports apex CNAME/ALIAS)
4. Loses Cloudflare CDN/WAF benefits

### C) Re-add to Bekzod27 Cloudflare account
Re-add `raos.uz` site, get new NS pair, update at ahost. Loses any old account configs (page rules, firewall, workers).

## Telegram thread
- Initial: msg 3654 / 3656
- Status update: msg 3660
- Decision request: msg 3661

## What was completed
1. Railway CLI link + GraphQL DNS query
2. ahost.uz login (yormatov3@gmail.com / U37804)
3. Confirmed Cloudflare delegation
4. Cloudflare dashboard inspection (account empty)

## Pending
Bekzod decision on path A/B/C.

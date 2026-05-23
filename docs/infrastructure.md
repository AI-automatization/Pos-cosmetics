# RAOS Infrastructure — DNS & Deploy

## DNS Map (raos.uz)

| Subdomain | Target | Service | SSL |
|-----------|--------|---------|-----|
| `raos.uz` | Landing page (Vercel/Netlify) | apps/landing | Auto (Vercel) |
| `www.raos.uz` | CNAME → raos.uz | Redirect | Auto |
| `app.raos.uz` | Railway (web admin panel) | apps/web | Railway auto-cert |
| `api.raos.uz` | Railway (NestJS API) | apps/api | Railway auto-cert |
| `admin.raos.uz` | Railway (super-admin panel) | apps/super-admin | Railway auto-cert |

## DNS Records to Create

```
# A/CNAME records at DNS provider
raos.uz          A       76.76.21.21         # Vercel (or CNAME cname.vercel-dns.com)
www              CNAME   raos.uz
app              CNAME   web-production-5b0b7.up.railway.app
api              CNAME   api-production-c5b6.up.railway.app
admin            CNAME   super-admin-production-a0db.up.railway.app
```

## Railway Custom Domains

Each Railway service needs the custom domain added:
1. Railway Dashboard > Service > Settings > Custom Domain
2. Add domain (e.g., `api.raos.uz`)
3. Railway generates SSL cert automatically via Let's Encrypt

## CORS Configuration

Production `CORS_ORIGIN` env var on Railway API service:
```
CORS_ORIGIN=https://app.raos.uz,https://raos.uz,https://www.raos.uz,https://admin.raos.uz,https://web-production-5b0b7.up.railway.app,https://super-admin-production-a0db.up.railway.app
```

## Environment Variables (per service)

### apps/api (Railway)
- `CORS_ORIGIN` — see above
- `NODE_ENV=production`
- `DATABASE_URL` — auto from Railway PostgreSQL
- All other vars from `.env.example`

### apps/web (Railway)
- `NEXT_PUBLIC_API_URL=https://api.raos.uz/api/v1`

### apps/super-admin (Railway)
- `NEXT_PUBLIC_API_URL=https://api.raos.uz/api/v1`

### apps/landing (Vercel/Netlify)
- `NEXT_PUBLIC_API_URL=https://api.raos.uz/api/v1` (if needed for registration form)

## Deploy Flow

```
Push to main → Railway auto-deploys (GitHub integration)
                → api, web, super-admin, worker, bot
Landing page → Separate repo or Vercel project (manual deploy)
```

Never use `railway up` — see CLAUDE.md.

## Verification Checklist

- [ ] `dig api.raos.uz` resolves to Railway
- [ ] `dig app.raos.uz` resolves to Railway
- [ ] `dig raos.uz` resolves to Vercel/Netlify
- [ ] `curl -I https://api.raos.uz/api/v1/health/ping` returns 200
- [ ] `curl -I https://app.raos.uz` returns 200
- [ ] CORS preflight works: `curl -X OPTIONS https://api.raos.uz/api/v1/ -H "Origin: https://app.raos.uz"` includes `Access-Control-Allow-Origin`

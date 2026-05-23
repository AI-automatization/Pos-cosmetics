import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "RAOS — Smart POS tizimi O'zbekiston uchun"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0E1530',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blob top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'rgba(36,212,244,0.07)',
            filter: 'blur(80px)',
          }}
        />
        {/* Blob bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(95,238,251,0.05)',
            filter: 'blur(80px)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: '#24D4F4',
            letterSpacing: '-3px',
            marginBottom: 12,
          }}
        >
          RAOS
        </div>

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(36,212,244,0.1)',
            border: '1px solid rgba(36,212,244,0.3)',
            borderRadius: 100,
            padding: '8px 24px',
            marginBottom: 36,
          }}
        >
          <span style={{ color: '#24D4F4', fontSize: 18, fontWeight: 600 }}>
            Smart POS tizimi · O'zbekiston uchun
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 860,
            lineHeight: 1.25,
            marginBottom: 20,
          }}
        >
          Kassa · Sklad · Soliq.uz · AI hisobot
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: 'rgb(148,163,184)',
            textAlign: 'center',
            maxWidth: 700,
            marginBottom: 48,
          }}
        >
          30 kun bepul sinov — karta kerak emas. Offline ishlaydi.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 14 }}>
          {['✓ Offline', '✓ Soliq.uz', '✓ AI hisobot', '✓ 30 kun bepul'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(36,212,244,0.08)',
                border: '1px solid rgba(36,212,244,0.2)',
                borderRadius: 10,
                padding: '10px 20px',
                color: '#ffffff',
                fontSize: 18,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            color: 'rgb(100,116,139)',
            fontSize: 20,
            letterSpacing: '1px',
          }}
        >
          raos.uz
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

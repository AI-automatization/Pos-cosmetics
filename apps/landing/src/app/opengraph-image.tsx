import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "RAOS — Smart POS tizimi O'zbekiston uchun"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PRODUCTS = [
  { name: 'Lancome Perfume', price: '320 000' },
  { name: 'Revlon Foundation', price: '185 000' },
  { name: "L'Oreal Shampoo", price: '96 000' },
]

const PILLS = ['✓ Offline', '✓ Soliq.uz', '✓ AI hisobot', '✓ 3 til']

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0E1530',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow top */}
        <div
          style={{
            position: 'absolute',
            top: '-180px',
            left: '250px',
            width: '700px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(36,212,244,0.06)',
            filter: 'blur(90px)',
          }}
        />
        {/* Glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-80px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.07)',
            filter: 'blur(80px)',
          }}
        />

        {/* LEFT */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '56px 48px 56px 80px',
            width: '620px',
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: '#24D4F4',
              letterSpacing: '-4px',
              lineHeight: 1,
              marginBottom: 18,
            }}
          >
            RAOS
          </div>

          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              background: 'rgba(36,212,244,0.08)',
              border: '1px solid rgba(36,212,244,0.22)',
              borderRadius: 100,
              padding: '6px 18px',
              marginBottom: 28,
            }}
          >
            <span style={{ color: '#24D4F4', fontSize: 15, fontWeight: 600 }}>
              Smart POS tizimi · O'zbekiston uchun
            </span>
          </div>

          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            Kassa. Sklad. Soliq.uz.
          </div>

          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#24D4F4',
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            AI hisobot.
          </div>

          <div
            style={{
              fontSize: 18,
              color: 'rgb(148,163,184)',
              marginBottom: 4,
            }}
          >
            30 kun bepul sinov — karta kerak emas.
          </div>

          <div
            style={{
              fontSize: 18,
              color: 'rgb(148,163,184)',
              marginBottom: 36,
            }}
          >
            Offline ishlaydi. Bitta joyda.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PILLS.map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  background: 'rgba(36,212,244,0.07)',
                  border: '1px solid rgba(36,212,244,0.18)',
                  borderRadius: 8,
                  padding: '7px 14px',
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 32,
              color: 'rgb(100,116,139)',
              fontSize: 16,
              letterSpacing: '1.5px',
            }}
          >
            raos.uz
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            position: 'absolute',
            left: '620px',
            top: '50px',
            height: '530px',
            width: '1px',
            background: 'rgba(36,212,244,0.12)',
          }}
        />

        {/* RIGHT — POS mock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(36,212,244,0.14)',
              borderRadius: 20,
              padding: '28px',
              width: '310px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 22,
              }}
            >
              <span style={{ color: '#24D4F4', fontWeight: 800, fontSize: 18 }}>
                RAOS POS
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.28)',
                  borderRadius: 100,
                  padding: '3px 10px',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10B981',
                  }}
                />
                <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700 }}>
                  OFFLINE
                </span>
              </div>
            </div>

            {/* Products */}
            {PRODUCTS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 0',
                  borderBottom:
                    i < PRODUCTS.length - 1
                      ? '1px solid rgba(255,255,255,0.05)'
                      : 'none',
                }}
              >
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{item.name}</span>
                <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>
                  {item.price} so'm
                </span>
              </div>
            ))}

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'rgba(36,212,244,0.18)',
                margin: '14px 0',
              }}
            />

            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
                JAMI
              </span>
              <span style={{ color: '#24D4F4', fontSize: 22, fontWeight: 900 }}>
                601 000 so'm
              </span>
            </div>

            {/* Pay button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#24D4F4',
                borderRadius: 10,
                padding: '13px 0',
                color: '#0E1530',
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              To'lash →
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

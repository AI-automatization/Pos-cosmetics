import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0E1530',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        <span
          style={{
            color: '#24D4F4',
            fontSize: 100,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            letterSpacing: '-4px',
          }}
        >
          R
        </span>
      </div>
    ),
    { width: 180, height: 180 },
  )
}

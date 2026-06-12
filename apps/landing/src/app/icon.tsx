import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        <span
          style={{
            color: '#24D4F4',
            fontSize: 18,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            letterSpacing: '-1px',
          }}
        >
          R
        </span>
      </div>
    ),
    { width: 32, height: 32 },
  )
}

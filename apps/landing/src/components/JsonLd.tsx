export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RAOS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android, iOS, Windows, Web',
    description:
      "O'zbekiston uchun smart POS tizimi. Kassa, sklad, Soliq.uz, AI hisobot — bitta joyda.",
    url: 'https://raos.uz',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '249000',
      highPrice: '799000',
      priceCurrency: 'UZS',
      offerCount: '3',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '30',
    },
    author: {
      '@type': 'Organization',
      name: 'Tezcode',
      url: 'https://raos.uz',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

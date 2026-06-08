export default function JsonLd() {
  const softwareApp = {
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
    author: {
      '@type': 'Organization',
      name: 'Tezcode',
      url: 'https://raos.uz',
    },
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tezcode',
    url: 'https://raos.uz',
    logo: 'https://raos.uz/opengraph-image',
    sameAs: [
      'https://t.me/raos_support',
      'https://instagram.com/raos.uz',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+998-91-777-66-09',
      contactType: 'customer support',
      availableLanguage: ['Uzbek', 'Russian', 'English'],
    },
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'RAOS nima?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "RAOS — do'konlar uchun smart kassa tizimi. Kompyuter, planshet yoki telefonda ishlaydi. Tovar sotish, sklad, hisobot, Soliq.uz — hammasi bitta joyda.",
        },
      },
      {
        '@type': 'Question',
        name: "Internet bo'lmasa qanday ishlaydi?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Ma'lumotlar qurilmada saqlanadi. Savdo navbatga turadi. Internet kelganda avtomatik serverga yuboriladi. Hech narsa yo'qolmaydi.",
        },
      },
      {
        '@type': 'Question',
        name: "Necha so'm turadi?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Starter: 249,000 so'm/oy. Growth: 449,000. Pro: 799,000. Barcha rejalar uchun 30 kun bepul sinov — karta kerak emas.",
        },
      },
      {
        '@type': 'Question',
        name: "Ma'lumotlarim xavfsizmi?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Bank darajasidagi shifrlash (AES-256). Har kunlik backup. Faqat siz va ruxsat berganlar ko'ra oladi.",
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  )
}

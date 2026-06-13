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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '30',
      reviewCount: '30',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Aziz Karimov' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: "Internet o'chganda kassa to'xtardi. RAOS bilan bu muammo yo'q. Offline ishlaydi — savdo hech qachon to'xtamaydi.",
        datePublished: '2026-04-10',
        publisher: { '@type': 'Organization', name: "Kosmetika do'koni, Toshkent" },
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Nilufar Yusupova' },
        reviewRating: { '@type': 'Rating', ratingValue: '4', bestRating: '5' },
        reviewBody: "3 ta do'konni bitta telefondan ko'raman. Ertalab bir qarashda barcha savdo hisobotini bilaman.",
        datePublished: '2026-04-20',
        publisher: { '@type': 'Organization', name: 'Kiyim butigi, Samarqand' },
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Bobur Rahimov' },
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        reviewBody: 'AI Night Cashier juda qulay — ertalab Telegram ga keladi: qaysi atir tugayapti, qaysi yaxshi sotilmoqda.',
        datePublished: '2026-05-03',
        publisher: { '@type': 'Organization', name: 'Parfumeriya, Namangan' },
      },
    ],
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
      'https://instagram.com/raos_uzb',
      'https://github.com/AI-automatization',
      'https://www.tezcode.dev',
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
        name: 'RAOS nima? Bu kassa dasturimi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "RAOS — O'zbekiston do'konlari uchun POS tizimi va kassa dasturi. Kompyuter, planshet yoki telefonda ishlaydi. Tovar sotish, sklad, hisobot, Soliq.uz integratsiya — hammasi bitta joyda. Toshkent, Samarqand, Namangan va barcha shaharlarda ishlaydi.",
        },
      },
      {
        '@type': 'Question',
        name: 'Tizim A dan nimasi yaxshi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "3 asosiy farq: 1) RAOS OFFLINE ishlaydi — Tizim A internet kerak; 2) Soliq.uz integratsiya bepul — Tizim A da yo'q; 3) Oyiga 50,000 so'm arzon — 249K vs 299K.",
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
          text: "Starter: 249,000 so'm/oy. Growth: 449,000. Pro: 799,000. Pilot dasturida birinchi oy bepul — keyin tarif bo'yicha.",
        },
      },
      {
        '@type': 'Question',
        name: 'Telefonda ishlaydimi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Ha! 2 ta ilova: Kassir ilovasi (Android, sotish uchun) va Egasi ilovasi (iOS + Android, nazorat uchun).",
        },
      },
      {
        '@type': 'Question',
        name: 'Qanday boshlash mumkin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "1) Quyidagi formani to'ldiring; 2) Bizning jamoamiz 30 daqiqa ichida bog'lanadi; 3) Do'koningizni 2 daqiqada sozlaymiz.",
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
      {
        '@type': 'Question',
        name: "Yordam kerak bo'lsa?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Telegram: @raos_support (24/7). Telefon: +998 91 777 66 09 / +998 99 315 15 16 (ish kunlari 9-18). Video darsliklar ham bor.",
        },
      },
    ],
  }

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: "RAOS — POS tizimi va kassa dasturi",
    description: "O'zbekiston do'konlari uchun POS tizimi. Soliq.uz integratsiya, offline ishlaydi, AI hisobot. Toshkent, Samarqand, Namangan va barcha shaharlarda.",
    url: 'https://raos.uz',
    telephone: '+998917776609',
    email: 'info@raos.uz',
    logo: 'https://raos.uz/opengraph-image',
    image: 'https://raos.uz/opengraph-image',
    priceRange: '249 000 – 799 000 UZS/oy',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toshkent',
      addressRegion: 'Toshkent',
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.2995,
      longitude: 69.2401,
    },
    areaServed: [
      { '@type': 'City', name: 'Toshkent' },
      { '@type': 'City', name: 'Samarqand' },
      { '@type': 'City', name: 'Namangan' },
      { '@type': 'City', name: 'Andijon' },
      { '@type': 'City', name: "Farg'ona" },
      { '@type': 'City', name: 'Buxoro' },
      { '@type': 'City', name: 'Nukus' },
      { '@type': 'Country', name: "O'zbekiston" },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://t.me/raos_support',
      'https://instagram.com/raos_uzb',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'RAOS tarif rejalari',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '249000',
          priceCurrency: 'UZS',
          description: "1 ta filial, asosiy funksiyalar, Soliq.uz integratsiya",
        },
        {
          '@type': 'Offer',
          name: 'Growth',
          price: '449000',
          priceCurrency: 'UZS',
          description: "3 ta filial, AI hisobot, kengaytirilgan sklad",
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '799000',
          priceCurrency: 'UZS',
          description: "Cheksiz filiallar, to'liq AI analitika, API kirish",
        },
      ],
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
    </>
  )
}

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

export default function JsonLd() {
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://raos.uz/#software',
    name: 'RAOS',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Point of Sale',
    operatingSystem: 'Android, iOS, Windows, Web',
    description:
      "O'zbekiston uchun smart POS tizimi. Kassa, sklad, Soliq.uz, AI hisobot — bitta joyda.",
    url: 'https://raos.uz',
    downloadUrl: 'https://raos.uz/#register',
    softwareVersion: '1.0',
    releaseNotes: "Soliq.uz integratsiya, offline rejim, AI Night Cashier, 3 tilda interfeys.",
    inLanguage: ['uz', 'ru', 'en'],
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '249000',
      highPrice: '799000',
      priceCurrency: 'UZS',
      offerCount: '3',
      availability: 'https://schema.org/InStock',
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
      '@id': 'https://raos.uz/#organization',
    },
    provider: {
      '@type': 'Organization',
      '@id': 'https://raos.uz/#organization',
    },
    screenshot: 'https://raos.uz/opengraph-image',
    featureList: [
      "Offline ishlaydi — internet kerak emas",
      "Soliq.uz (OFD) integratsiya",
      "AI Night Cashier — avtomatik hisobot",
      "3 tilda interfeys (UZ, RU, EN)",
      "Ko'p filial boshqaruvi",
      "Mobil ilova (Android + iOS)",
      "Chegirma va loyalty tizimi",
      "QR kod va shtrix-kod skaneri",
    ],
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://raos.uz/#organization',
    name: 'Tezcode',
    legalName: 'Tezcode',
    url: 'https://raos.uz',
    logo: {
      '@type': 'ImageObject',
      url: 'https://raos.uz/opengraph-image',
      width: 1200,
      height: 630,
    },
    foundingDate: '2025',
    founders: [{ '@type': 'Person', name: 'Ibrat Tursunov' }],
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 10 },
    sameAs: [
      'https://t.me/raos_support',
      'https://instagram.com/raos.uz',
      'https://t.me/raos_uz',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+998-91-777-66-09',
        contactType: 'customer support',
        availableLanguage: ['Uzbek', 'Russian', 'English'],
        areaServed: 'UZ',
      },
      {
        '@type': 'ContactPoint',
        telephone: '+998-99-315-15-16',
        contactType: 'sales',
        availableLanguage: ['Uzbek', 'Russian'],
        areaServed: 'UZ',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toshkent',
      addressRegion: 'Toshkent',
      addressCountry: 'UZ',
    },
    knowsLanguage: ['uz', 'ru', 'en'],
  }

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://raos.uz/#website',
    name: 'RAOS',
    alternateName: ["RAOS POS", "RAOS kassa dasturi", "RAOS POS tizimi"],
    url: 'https://raos.uz',
    publisher: { '@type': 'Organization', '@id': 'https://raos.uz/#organization' },
    inLanguage: ['uz', 'ru', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://raos.uz/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://raos.uz/#webpage',
    url: 'https://raos.uz',
    name: "RAOS — POS tizimi va kassa dasturi O'zbekiston uchun",
    description: "POS tizimi va kassa dasturi O'zbekiston do'konlari uchun. Soliq.uz integratsiya, AI hisobot, offline ishlaydi.",
    isPartOf: { '@type': 'WebSite', '@id': 'https://raos.uz/#website' },
    about: { '@type': 'SoftwareApplication', '@id': 'https://raos.uz/#software' },
    publisher: { '@type': 'Organization', '@id': 'https://raos.uz/#organization' },
    inLanguage: 'uz',
    datePublished: '2026-01-15',
    dateModified: '2026-06-13',
    breadcrumb: { '@type': 'BreadcrumbList', '@id': 'https://raos.uz/#breadcrumb-home' },
  }

  const breadcrumbHome = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': 'https://raos.uz/#breadcrumb-home',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Bosh sahifa',
        item: 'https://raos.uz',
      },
    ],
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://raos.uz/#faq',
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
      // RU variants for multilingual FAQ
      {
        '@type': 'Question',
        name: 'Что такое RAOS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RAOS — POS система и кассовая программа для магазинов Узбекистана. Работает на компьютере, планшете и телефоне. Продажи, склад, отчёты, интеграция с Soliq.uz — всё в одном месте. Работает в Ташкенте, Самарканде, Намангане и по всей стране.',
        },
      },
      {
        '@type': 'Question',
        name: 'Работает ли RAOS без интернета?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Да! Данные хранятся на устройстве. Продажи встают в очередь. Когда интернет появится — автоматически отправляются на сервер. Ничего не теряется.',
        },
      },
      {
        '@type': 'Question',
        name: 'Сколько стоит RAOS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Starter: 249 000 сум/мес. Growth: 449 000. Pro: 799 000. Первый месяц бесплатно в пилотной программе.',
        },
      },
      // EN variants
      {
        '@type': 'Question',
        name: 'What is RAOS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'RAOS is a smart POS system and cash register software for retail stores in Uzbekistan. Works on computer, tablet, or phone. Sales, inventory, reports, Soliq.uz integration — all in one place. Available in Tashkent, Samarkand, Namangan and nationwide.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does RAOS work offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Data is stored on the device. Sales are queued. When internet returns, everything syncs automatically to the server. Nothing is lost.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does RAOS cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Starter: 249,000 UZS/month. Growth: 449,000. Pro: 799,000. First month free in our pilot program — no credit card required.',
        },
      },
    ],
  }

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'SoftwareCompany'],
    '@id': 'https://raos.uz/#localbusiness',
    name: "RAOS — POS tizimi va kassa dasturi",
    description: "O'zbekiston do'konlari uchun POS tizimi. Soliq.uz integratsiya, offline ishlaydi, AI hisobot. Toshkent, Samarqand, Namangan va barcha shaharlarda.",
    url: 'https://raos.uz',
    telephone: '+998917776609',
    email: 'info@raos.uz',
    logo: 'https://raos.uz/opengraph-image',
    image: 'https://raos.uz/opengraph-image',
    priceRange: '249 000 – 799 000 UZS/oy',
    currenciesAccepted: 'UZS',
    paymentAccepted: ['Cash', 'Click', 'Payme', 'Bank transfer'],
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
      { '@type': 'City', name: 'Qarshi' },
      { '@type': 'City', name: 'Jizzax' },
      { '@type': 'City', name: 'Navoiy' },
      { '@type': 'City', name: 'Urganch' },
      { '@type': 'City', name: 'Termiz' },
      { '@type': 'City', name: 'Guliston' },
      { '@type': 'City', name: 'Kokand' },
      { '@type': 'Country', name: "O'zbekiston" },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '15:00',
      },
    ],
    sameAs: [
      'https://t.me/raos_support',
      'https://instagram.com/raos.uz',
      'https://t.me/raos_uz',
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
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Growth',
          price: '449000',
          priceCurrency: 'UZS',
          description: "3 ta filial, AI hisobot, kengaytirilgan sklad",
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '799000',
          priceCurrency: 'UZS',
          description: "Cheksiz filiallar, to'liq AI analitika, API kirish",
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
        },
      ],
    },
  }

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': 'https://raos.uz/#howto',
    name: "RAOS POS tizimini qanday boshlash",
    description: "RAOS kassa dasturini 3 oddiy qadamda boshlang. Ro'yxatdan o'ting, do'koningizni sozlang va savdoni boshlang.",
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'UZS',
      value: '0',
    },
    tool: [
      { '@type': 'HowToTool', name: "Kompyuter, planshet yoki telefon" },
      { '@type': 'HowToTool', name: "Internet aloqasi (faqat boshlash uchun)" },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: "Ro'yxatdan o'ting",
        text: "Saytda formani to'ldiring — ism, telefon, do'kon turi. Jamoamiz 30 daqiqada bog'lanadi.",
        url: 'https://raos.uz/#register',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: "Do'koningizni sozlang",
        text: "Tovarlarni kiriting yoki Excel dan yuklang. Kassirlarni qo'shing. Soliq.uz ni ulang.",
        url: 'https://raos.uz/#register',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: "Savdoni boshlang",
        text: "Tayyor! Birinchi sotuvni amalga oshiring. AI Night Cashier ertalab hisobot yuboradi.",
        url: 'https://raos.uz/#register',
      },
    ],
  }

  const schemas = [softwareApp, organization, webSite, webPage, breadcrumbHome, faqPage, localBusiness, howTo]

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

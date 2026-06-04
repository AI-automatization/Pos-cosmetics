import type { Segment, Feature, PricingPlan, FAQItem, Testimonial, ComparisonRow } from '@/types'

export const segments: Segment[] = [
  {
    icon: 'Sparkles',
    title: "Kosmetika do'koni",
    description: "Yaroqlilik muddati kuzatuvi + tester alohida hisobi",
  },
  {
    icon: 'Shirt',
    title: 'Kiyim butigi',
    description: "O'lcham va rang varianti + mavsumiy chegirma avtomatik",
  },
  {
    icon: 'Settings',
    title: 'Avtozapchastlar',
    description: 'OEM/aftermarket qidirish + VIN kod bilan filtrlash',
  },
  {
    icon: 'ShoppingCart',
    title: 'Oziq-ovqat marketi',
    description: 'Tortish hisobi + yaroqlilik muddati alert',
  },
  {
    icon: 'Wind',
    title: 'Parfumeriya',
    description: 'Hajm varianti (30ml/50ml/100ml) + atir kategoriyalar',
  },
  {
    icon: 'Smartphone',
    title: "Telefon do'koni",
    description: 'IMEI tracking + kafolat muddati kuzatuvi',
  },
  {
    icon: 'Eye',
    title: 'Optika',
    description: "Retsept saqlash + linza stok boshqaruvi",
  },
]

export const features: Feature[] = [
  {
    icon: 'ShieldCheck',
    title: "Soliq.uz integratsiya",
    description:
      "Har sotuvdan fiskal chek avtomatik. Jarima xavfi nol. OFD orqali to'g'ridan-to'g'ri.",
    badge: "Tizim A da YO'Q",
  },
  {
    icon: 'Brain',
    title: 'Haqiqiy AI (Night Cashier)',
    description:
      'Tunda data tahlil qiladi, ertalab sizga aytadi: qaysi tovar tugayapti, qaysi yaxshi sotilmoqda.',
    badge: 'Haqiqiy AI',
  },
  {
    icon: 'Gift',
    title: '30 kun bepul sinov',
    description:
      "Hech narsa to'lamaysiz. Karta talab qilinmaydi. O'zingiz sinab ko'ring.",
    badge: 'Bepul',
  },
  {
    icon: 'WifiOff',
    title: 'Offline ishlaydi',
    description:
      "Internet uzilsa ham kassa ishlashda davom etadi. Ma'lumotlar sinxronlanadi.",
    badge: "Faqat RAOS da",
  },
  {
    icon: 'Globe',
    title: '3 tilda (UZ/RU/EN)',
    description:
      "O'zbek, Rus, Ingliz tillarida. Xorijiy brend egalari uchun ham mos.",
    badge: '3 til',
  },
]

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 249000,
    yearlyPrice: 186750,
    description: "Kichik do'kon uchun ideal boshlang'ich",
    features: [
      '1 filial',
      'Cheksiz mahsulot',
      'Kassa + sklad',
      "Soliq.uz integratsiya",
      'Telegram bildirishnomalar',
      "Email qo'llab-quvvatlash",
    ],
    cta: 'Bepul boshlash',
  },
  {
    name: 'Growth',
    price: 449000,
    yearlyPrice: 336750,
    description: "O'sib borayotgan biznes uchun",
    features: [
      '3 filial',
      "Hammasi Starter da bor",
      'Hisobotlar va analitika',
      'SMS kampaniya',
      'Sodiqlik dasturi',
      "Prioritet qo'llab-quvvatlash",
    ],
    cta: 'Bepul boshlash',
    highlighted: true,
    badge: 'TAVSIYA ETILADI',
  },
  {
    name: 'Pro',
    price: 799000,
    yearlyPrice: 599250,
    description: 'Katta tarmoq va investorlar uchun',
    features: [
      'Cheksiz filial',
      "Hammasi Growth da bor",
      'AI Night Cashier',
      'API kirish',
      "1C integratsiya",
      'Shaxsiy menejer',
    ],
    cta: "Biz bilan bog'laning",
  },
]

export const faqItems: FAQItem[] = [
  {
    question: 'RAOS nima?',
    answer:
      "RAOS — do'konlar uchun smart kassa tizimi. Kompyuter, planshet yoki telefonda ishlaydi. Tovar sotish, sklad, hisobot, Soliq.uz — hammasi bitta joyda.",
  },
  {
    question: 'Tizim A dan nimasi yaxshi?',
    answer:
      "3 asosiy farq: 1) RAOS OFFLINE ishlaydi — Tizim A internet kerak; 2) Soliq.uz integratsiya bepul — Tizim A da yo'q; 3) Oyiga 50,000 so'm arzon — 249K vs 299K.",
  },
  {
    question: "Internet bo'lmasa qanday ishlaydi?",
    answer:
      "Ma'lumotlar qurilmada saqlanadi. Savdo \"navbatga\" turadi. Internet kelganda avtomatik serverga yuboriladi. Hech narsa yo'qolmaydi.",
  },
  {
    question: "Necha so'm turadi?",
    answer:
      "Starter: 249,000 so'm/oy. Growth: 449,000. Pro: 799,000. Barcha rejalar uchun 30 kun bepul sinov — karta kerak emas.",
  },
  {
    question: 'Telefonda ishlaydimi?',
    answer:
      "Ha! 2 ta ilova: Kassir ilovasi (Android, sotish uchun) va Egasi ilovasi (iOS + Android, nazorat uchun).",
  },
  {
    question: "Qanday boshlash mumkin?",
    answer:
      "1) Quyidagi formani to'ldiring; 2) Bizning jamoamiz 30 daqiqa ichida bog'lanadi; 3) Do'koningizni 2 daqiqada sozlaymiz.",
  },
  {
    question: "Ma'lumotlarim xavfsizmi?",
    answer:
      "Bank darajasidagi shifrlash (AES-256). Har kunlik backup. Faqat siz va ruxsat berganlar ko'ra oladi.",
  },
  {
    question: 'Yordam kerak bo\'lsa?',
    answer:
      "Telegram: @raos_support (24/7). Telefon: +998 XX XXX XX XX (ish kunlari 9-18). Video darsliklar ham bor.",
  },
]

export const comparisonRows: ComparisonRow[] = [
  {
    feature: "Boshlang'ich narx",
    raos: "249,000 so'm",
    billz: "299,000 so'm",
    yespos: "100,000 so'm",
  },
  {
    feature: 'Bepul sinov',
    raos: '30 kun',
    billz: '7 kun',
    yespos: 'Oy oxirigacha',
  },
  { feature: 'OFFLINE ishlaydi', raos: true, billz: false, yespos: false },
  {
    feature: 'Soliq.uz (OFD)',
    raos: true,
    billz: false,
    yespos: "Qo'shimcha",
  },
  { feature: "Haqiqiy AI", raos: true, billz: false, yespos: false },
  { feature: 'Ingliz tili', raos: true, billz: false, yespos: false },
]

export const testimonials: Testimonial[] = [
  {
    name: 'Aziz Karimov',
    business: "Kosmetika do'koni, Toshkent",
    text: "Internet o'chganda kassa to'xtardi. RAOS bilan bu muammo yo'q. Offline ishlaydi — savdo hech qachon to'xtamaydi.",
    rating: 5,
  },
  {
    name: 'Nilufar Yusupova',
    business: 'Kiyim butigi, Samarqand',
    text: "3 ta do'konni bitta telefondan ko'raman. Ertalab bir qarashda barcha savdo hisobotini bilaman.",
    rating: 5,
  },
  {
    name: 'Bobur Rahimov',
    business: 'Parfumeriya, Namangan',
    text: "AI Night Cashier juda qulay — ertalab Telegram ga keladi: qaysi atir tugayapti, qaysi yaxshi sotilmoqda.",
    rating: 5,
  },
]

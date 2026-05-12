"""
RAOS Admin Panel — Foydalanish bo'yicha qo'llanma
PowerPoint presentation generator
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os

# ═══════════════════════════════════════════════════
# DESIGN SYSTEM
# ═══════════════════════════════════════════════════
PRIMARY = RGBColor(0x1E, 0x40, 0xAF)       # Deep blue
PRIMARY_LIGHT = RGBColor(0x3B, 0x82, 0xF6)  # Blue
ACCENT = RGBColor(0x06, 0xB6, 0xD4)         # Cyan
SUCCESS = RGBColor(0x10, 0xB9, 0x81)         # Green
WARNING = RGBColor(0xF5, 0x9E, 0x0B)         # Amber
DANGER = RGBColor(0xEF, 0x44, 0x44)          # Red
DARK = RGBColor(0x1F, 0x29, 0x37)            # Dark gray
MEDIUM = RGBColor(0x64, 0x74, 0x8B)          # Medium gray
LIGHT = RGBColor(0xF8, 0xFA, 0xFC)           # Light bg
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BORDER = RGBColor(0xE2, 0xE8, 0xF0)          # Border gray

SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

prs = Presentation()
prs.slide_width = SLIDE_WIDTH
prs.slide_height = SLIDE_HEIGHT


def add_shape(slide, left, top, width, height, fill_color=None, border_color=None, border_width=Pt(0)):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.line.fill.background()
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = border_width
    return shape


def add_rounded_shape(slide, left, top, width, height, fill_color=None, border_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.line.fill.background()
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)
    return shape


def add_text(slide, left, top, width, height, text, font_size=14, color=DARK, bold=False, alignment=PP_ALIGN.LEFT, font_name="Arial"):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return txBox


def add_bullet_list(slide, left, top, width, height, items, font_size=13, color=DARK, spacing=Pt(6)):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = item
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.font.name = "Arial"
        p.space_after = spacing
        p.level = 0
    return txBox


def add_icon_text(slide, left, top, icon, text, font_size=13, color=DARK):
    add_text(slide, left, top, Inches(0.5), Inches(0.4), icon, font_size=font_size+4, color=PRIMARY_LIGHT, alignment=PP_ALIGN.CENTER, font_name="Segoe UI Emoji")
    add_text(slide, left + Inches(0.55), top + Inches(0.03), Inches(4), Inches(0.35), text, font_size=font_size, color=color)


def make_card(slide, left, top, width, height, title, items, icon="", title_color=PRIMARY):
    card = add_rounded_shape(slide, left, top, width, height, fill_color=WHITE, border_color=BORDER)
    # Title bar
    add_shape(slide, left, top, width, Inches(0.5), fill_color=PRIMARY)
    add_text(slide, left + Inches(0.2), top + Inches(0.08), width - Inches(0.4), Inches(0.4),
             f"{icon}  {title}", font_size=14, color=WHITE, bold=True)
    # Items
    y = top + Inches(0.65)
    for item in items:
        add_text(slide, left + Inches(0.25), y, width - Inches(0.5), Inches(0.3),
                 f"  {item}", font_size=11, color=DARK)
        y += Inches(0.28)


def make_table_card(slide, left, top, width, rows, col_widths=None):
    """Create a styled table"""
    n_rows = len(rows)
    n_cols = len(rows[0]) if rows else 2
    table_shape = slide.shapes.add_table(n_rows, n_cols, left, top, width, Inches(0.35 * n_rows))
    table = table_shape.table

    for i, row in enumerate(rows):
        for j, cell_text in enumerate(row):
            cell = table.cell(i, j)
            cell.text = cell_text
            cell.text_frame.paragraphs[0].font.size = Pt(11)
            cell.text_frame.paragraphs[0].font.name = "Arial"
            if i == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = PRIMARY
                cell.text_frame.paragraphs[0].font.color.rgb = WHITE
                cell.text_frame.paragraphs[0].font.bold = True
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = WHITE if i % 2 == 1 else RGBColor(0xF1, 0xF5, 0xF9)
                cell.text_frame.paragraphs[0].font.color.rgb = DARK
            cell.text_frame.paragraphs[0].alignment = PP_ALIGN.LEFT
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE

    if col_widths:
        for i, w in enumerate(col_widths):
            table.columns[i].width = w

    return table_shape


# ═══════════════════════════════════════════════════
# SLIDE 1: COVER
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
# Full background
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, SLIDE_HEIGHT, fill_color=PRIMARY)
# Accent stripe
add_shape(slide, Inches(0), Inches(0), Inches(0.15), SLIDE_HEIGHT, fill_color=ACCENT)
# Bottom gradient bar
add_shape(slide, Inches(0), Inches(6.5), SLIDE_WIDTH, Inches(1), fill_color=RGBColor(0x15, 0x30, 0x8A))

# Logo area
add_rounded_shape(slide, Inches(5.5), Inches(1.2), Inches(2.3), Inches(2.3), fill_color=WHITE)
add_text(slide, Inches(5.5), Inches(1.5), Inches(2.3), Inches(1.5), "RAOS", font_size=54, color=PRIMARY, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(5.5), Inches(2.7), Inches(2.3), Inches(0.5), "v3.0", font_size=18, color=MEDIUM, alignment=PP_ALIGN.CENTER)

# Title
add_text(slide, Inches(1), Inches(4.0), Inches(11.3), Inches(0.8),
         "RAOS — Admin Panel", font_size=40, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(4.8), Inches(11.3), Inches(0.5),
         "Foydalanish bo'yicha qo'llanma", font_size=22, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(5.5), Inches(11.3), Inches(0.4),
         "Retail & Asset Operating System  |  Multi-tenant  |  Offline-first", font_size=14, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)

# Footer
add_text(slide, Inches(1), Inches(6.7), Inches(11.3), Inches(0.4),
         "raos.uz  |  2025-2026", font_size=12, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════
# SLIDE 2: MUNDARIJA (Table of Contents)
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(11.7), Inches(0.7),
         "Mundarija", font_size=32, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

sections = [
    ("1", "Tizimga kirish (Login)", "Brauzer orqali tizimga kirish"),
    ("2", "Bosh sahifa (Dashboard)", "Asosiy ko'rsatkichlar va grafik"),
    ("3", "Katalog — Mahsulotlar", "Tovarlar, kategoriyalar, yetkazuvchilar"),
    ("4", "Ombor (Inventory)", "Qoldiqlar, kirim, chiqim, harakatlar"),
    ("5", "Mijozlar (Customers)", "Mijozlar bazasi va tarix"),
    ("6", "Xodimlar (Workers)", "Hodimlar va rollar boshqaruvi"),
    ("7", "Sotuvlar va Kassa (POS)", "Buyurtmalar, qaytarishlar, smenalar"),
    ("8", "Hisobotlar va Analitika", "Kunlik tushum, top mahsulotlar"),
    ("9", "Moliya — Nasiya / Chegirma", "Qarz boshqaruvi va chegirmalar"),
    ("10", "Ko'chmas mulk", "Ijaralar va daromadlilik"),
    ("11", "Sozlamalar", "Foydalanuvchilar, filiallar, printer"),
    ("12", "Kundalik ish tartibi", "Har kungi qadamlar"),
]

col1_x = Inches(0.8)
col2_x = Inches(7)
y_start = Inches(1.6)

for i, (num, title, desc) in enumerate(sections):
    x = col1_x if i < 6 else col2_x
    y = y_start + Inches(0.85) * (i if i < 6 else i - 6)

    # Number circle
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, x, y, Inches(0.45), Inches(0.45))
    circle.fill.solid()
    circle.fill.fore_color.rgb = PRIMARY
    circle.line.fill.background()
    tf = circle.text_frame
    tf.paragraphs[0].text = num
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = WHITE
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    add_text(slide, x + Inches(0.6), y - Inches(0.02), Inches(5), Inches(0.3),
             title, font_size=15, color=DARK, bold=True)
    add_text(slide, x + Inches(0.6), y + Inches(0.25), Inches(5), Inches(0.25),
             desc, font_size=11, color=MEDIUM)


# ═══════════════════════════════════════════════════
# SLIDE 3: LOGIN
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(5), Inches(0.7),
         "1. Tizimga kirish (Login)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# Steps
add_text(slide, Inches(0.8), Inches(1.5), Inches(5.5), Inches(0.4),
         "Brauzerda admin panel manzilini oching:", font_size=14, color=DARK)

# URL box
url_box = add_rounded_shape(slide, Inches(0.8), Inches(2.0), Inches(5.5), Inches(0.5), fill_color=RGBColor(0xF1, 0xF5, 0xF9), border_color=BORDER)
add_text(slide, Inches(1.0), Inches(2.08), Inches(5), Inches(0.35),
         "https://your-domain.com/login", font_size=14, color=PRIMARY_LIGHT, bold=True, font_name="Consolas")

# Login form fields table
make_table_card(slide, Inches(0.8), Inches(2.8), Inches(5.5), [
    ["Maydon", "Tavsif"],
    ["Email", "Admin email manzilingiz"],
    ["Parol", "Administrator bergan parol"],
], col_widths=[Inches(1.8), Inches(3.7)])

add_text(slide, Inches(0.8), Inches(4.5), Inches(5.5), Inches(0.8),
         "Barcha maydonlarni to'ldiring va \"Войти\" tugmasini bosing.\n\nEslatma: Tizim sizning rolingizga qarab tegishli panelni ochadi (Owner / Admin / Manager / Warehouse).",
         font_size=12, color=MEDIUM)

# Login form mockup
add_rounded_shape(slide, Inches(7.2), Inches(1.5), Inches(5.2), Inches(5.2), fill_color=WHITE, border_color=BORDER)
add_text(slide, Inches(7.2), Inches(1.8), Inches(5.2), Inches(0.6),
         "RAOS", font_size=28, color=PRIMARY, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(7.2), Inches(2.4), Inches(5.2), Inches(0.4),
         "Вход в систему", font_size=16, color=MEDIUM, alignment=PP_ALIGN.CENTER)

# Email field mockup
add_rounded_shape(slide, Inches(8.0), Inches(3.1), Inches(3.6), Inches(0.5), fill_color=LIGHT, border_color=BORDER)
add_text(slide, Inches(8.1), Inches(3.17), Inches(3.4), Inches(0.35),
         "Email", font_size=12, color=MEDIUM)

# Password field mockup
add_rounded_shape(slide, Inches(8.0), Inches(3.8), Inches(3.6), Inches(0.5), fill_color=LIGHT, border_color=BORDER)
add_text(slide, Inches(8.1), Inches(3.87), Inches(3.4), Inches(0.35),
         "Parol", font_size=12, color=MEDIUM)

# Login button mockup
btn = add_rounded_shape(slide, Inches(8.0), Inches(4.6), Inches(3.6), Inches(0.5), fill_color=PRIMARY)
add_text(slide, Inches(8.0), Inches(4.67), Inches(3.6), Inches(0.35),
         "Войти", font_size=14, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)

# Role info
add_text(slide, Inches(7.5), Inches(5.5), Inches(4.8), Inches(1),
         "Rollar: Owner (5) > Admin (4) > Manager (3) > Cashier (2) > Viewer (1)", font_size=10, color=MEDIUM, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════
# SLIDE 4: DASHBOARD
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(5), Inches(0.7),
         "2. Bosh sahifa (Dashboard)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# KPI Cards
kpis = [
    ("Bugungi sotuvlar", "1,250,000 so'm", SUCCESS, "Bugungi barcha sotuvlar yig'indisi"),
    ("Bugungi tushum", "850,000 so'm", PRIMARY_LIGHT, "Sof tushum summasi"),
    ("Buyurtmalar", "47 ta", ACCENT, "Bugungi buyurtmalar soni"),
    ("Kam qolgan", "12 ta", WARNING, "Kamayib qolgan tovarlar"),
]

for i, (title, value, color, desc) in enumerate(kpis):
    x = Inches(0.6) + Inches(3.1) * i
    y = Inches(1.5)
    card = add_rounded_shape(slide, x, y, Inches(2.9), Inches(1.5), fill_color=WHITE, border_color=BORDER)
    # Color stripe top
    add_shape(slide, x, y, Inches(2.9), Inches(0.06), fill_color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.2), Inches(2.5), Inches(0.3),
             title, font_size=12, color=MEDIUM)
    add_text(slide, x + Inches(0.2), y + Inches(0.5), Inches(2.5), Inches(0.5),
             value, font_size=22, color=DARK, bold=True)
    add_text(slide, x + Inches(0.2), y + Inches(1.05), Inches(2.5), Inches(0.3),
             desc, font_size=9, color=MEDIUM)

# Chart area
add_rounded_shape(slide, Inches(0.6), Inches(3.3), Inches(7.5), Inches(3.8), fill_color=WHITE, border_color=BORDER)
add_text(slide, Inches(0.8), Inches(3.5), Inches(3), Inches(0.4),
         "Haftalik tushum grafigi", font_size=14, color=DARK, bold=True)

# Fake chart bars
days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]
heights = [2.2, 1.8, 2.8, 2.0, 3.0, 1.5, 0.8]
for i, (day, h) in enumerate(zip(days, heights)):
    bar_x = Inches(1.3) + Inches(0.85) * i
    bar_y = Inches(6.5) - Inches(h)
    add_rounded_shape(slide, bar_x, bar_y, Inches(0.5), Inches(h), fill_color=PRIMARY_LIGHT if i != 4 else ACCENT)
    add_text(slide, bar_x - Inches(0.05), Inches(6.6), Inches(0.6), Inches(0.3),
             day, font_size=10, color=MEDIUM, alignment=PP_ALIGN.CENTER)

# Top Products
add_rounded_shape(slide, Inches(8.4), Inches(3.3), Inches(4.3), Inches(3.8), fill_color=WHITE, border_color=BORDER)
add_text(slide, Inches(8.6), Inches(3.5), Inches(3), Inches(0.4),
         "Top mahsulotlar", font_size=14, color=DARK, bold=True)

products = [
    ("1. Krem SPF-50", "128 ta"),
    ("2. Lak Red Rose", "95 ta"),
    ("3. Shampun Argan", "87 ta"),
    ("4. Parfum Chanel", "72 ta"),
    ("5. Tush Mascara", "65 ta"),
]
for i, (name, qty) in enumerate(products):
    y = Inches(4.1) + Inches(0.45) * i
    add_text(slide, Inches(8.7), y, Inches(2.8), Inches(0.35), name, font_size=12, color=DARK)
    add_text(slide, Inches(11.5), y, Inches(1), Inches(0.35), qty, font_size=12, color=SUCCESS, bold=True, alignment=PP_ALIGN.RIGHT)


# ═══════════════════════════════════════════════════
# SLIDE 5: CATALOG — PRODUCTS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "3. Katalog — Mahsulotlar", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

add_text(slide, Inches(0.8), Inches(1.5), Inches(11.5), Inches(0.4),
         "\"Каталог\" > \"Товары\" bo'limiga o'ting. Barcha mahsulotlaringizni shu yerda boshqarasiz.",
         font_size=14, color=DARK)

# Product table mockup
make_table_card(slide, Inches(0.8), Inches(2.2), Inches(11.7), [
    ["Nomi", "SKU", "Kategoriya", "Narxi", "Qoldiq", "Holat"],
    ["Krem SPF-50", "COS-001", "Yuz parvarishi", "85,000", "128", "Faol"],
    ["Lak Red Rose", "COS-002", "Tirnoq", "35,000", "95", "Faol"],
    ["Shampun Argan", "COS-003", "Soch", "42,000", "87", "Faol"],
    ["Parfum Chanel No.5", "COS-004", "Parfyumeriya", "450,000", "12", "Kam!"],
    ["Tush Mascara Pro", "COS-005", "Ko'z", "65,000", "65", "Faol"],
], col_widths=[Inches(2.5), Inches(1.5), Inches(2), Inches(1.5), Inches(1.2), Inches(1)])

# Feature cards
features = [
    ("Qo'shish", "\"Добавить\" tugmasi orqali yangi mahsulot kiritasiz. Nomi, SKU, narx, kategoriya — majburiy maydonlar."),
    ("Tahrirlash", "Mahsulot qatorini bosib tahrirlash oynasini ochasiz. Narx, nom, kategoriyani o'zgartirish mumkin."),
    ("Shtrix-kod", "Har mahsulotga barcode biriktiriladi. Kamera yoki skaner orqali tezkor qidiruv."),
    ("Import/Export", "Excel yoki CSV fayldan tovarlarni import qilish mumkin. Eksport ham mavjud."),
]

for i, (title, desc) in enumerate(features):
    x = Inches(0.8) + Inches(3.05) * i
    y = Inches(5.0)
    card = add_rounded_shape(slide, x, y, Inches(2.85), Inches(2.0), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(2.85), Inches(0.05), fill_color=PRIMARY_LIGHT)
    add_text(slide, x + Inches(0.2), y + Inches(0.2), Inches(2.4), Inches(0.3),
             title, font_size=13, color=PRIMARY, bold=True)
    add_text(slide, x + Inches(0.2), y + Inches(0.55), Inches(2.4), Inches(1.3),
             desc, font_size=10, color=MEDIUM)


# ═══════════════════════════════════════════════════
# SLIDE 6: CATEGORIES + SUPPLIERS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "3b. Kategoriyalar va Yetkazib beruvchilar", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# Categories card
make_card(slide, Inches(0.8), Inches(1.5), Inches(5.8), Inches(5.5),
          "Kategoriyalar", [
              "Mahsulotlarni guruhlarga ajratish",
              "Masalan: Yuz parvarishi, Soch, Tirnoq, Parfyumeriya",
              "Har kategoriya uchun ota-kategoriya tanlanishi mumkin",
              "Drag-and-drop tartib o'zgartirish",
              "Kategoriya bo'yicha filtr va hisobot",
          ], icon="")

# Suppliers card
make_card(slide, Inches(7.0), Inches(1.5), Inches(5.8), Inches(5.5),
          "Yetkazib beruvchilar (Поставщики)", [
              "Yetkazib beruvchilar ro'yxati va kontaktlar",
              "Har bir yetkazuvchi uchun: ism, telefon, kompaniya",
              "Kirim (поставка) yetkazuvchiga bog'lanadi",
              "Qarz holati: qancha to'lanmagan",
              "Yetkazuvchi bo'yicha tarix ko'rish",
          ], icon="")


# ═══════════════════════════════════════════════════
# SLIDE 7: INVENTORY
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "4. Ombor (Inventory)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# Sub-sections
inv_sections = [
    ("Qoldiqlar", "Barcha mahsulotlarning hozirgi ombordagi miqdori. Kamayib qolganlar qizil rang bilan belgilanadi.", SUCCESS),
    ("Kirim (Приход)", "Yangi tovar kelganda \"Приход\" tugmasini bosib miqdor kiritasiz. Yetkazuvchi va narxni tanlang.", PRIMARY_LIGHT),
    ("Chiqim (Расход)", "Tovar omborddan chiqarilganda — singan, eskirgan, tester uchun. Sababini tanlash majburiy.", WARNING),
    ("Harakatlar", "Barcha kirim/chiqim tarixi. Sana, miqdor, sabab, kim kiritgani ko'rinadi.", ACCENT),
]

for i, (title, desc, color) in enumerate(inv_sections):
    x = Inches(0.6) + Inches(3.15) * i
    y = Inches(1.5)
    card = add_rounded_shape(slide, x, y, Inches(2.95), Inches(2.5), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(2.95), Inches(0.06), fill_color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.2), Inches(2.5), Inches(0.4),
             title, font_size=15, color=color, bold=True)
    add_text(slide, x + Inches(0.2), y + Inches(0.65), Inches(2.5), Inches(1.6),
             desc, font_size=11, color=DARK)

# Movement types table
add_text(slide, Inches(0.8), Inches(4.3), Inches(5), Inches(0.4),
         "Ombor harakat turlari:", font_size=14, color=DARK, bold=True)

make_table_card(slide, Inches(0.8), Inches(4.8), Inches(11.7), [
    ["Harakat turi", "Tavsif", "Misol"],
    ["PURCHASE", "Yetkazuvchidan yangi tovar kelishi", "100 ta krem sotib olindi"],
    ["SALE", "Mijozga sotish (avtomatik)", "Kassadan 1 ta sotildi"],
    ["RETURN", "Mijozdan qaytarish", "Buzilgan tovar qaytarildi"],
    ["ADJUSTMENT", "Inventarizatsiya tuzatish", "Sanash: +5 / -3 farq"],
    ["TESTER", "Tester uchun chiqim", "Namuna uchun 2 ta ajratildi"],
    ["WASTE", "Buzilgan / eskirgan tovar", "3 ta muddati o'tgan"],
    ["TRANSFER", "Filiallar arasi ko'chirish", "Filial A -> Filial B: 20 ta"],
])


# ═══════════════════════════════════════════════════
# SLIDE 8: CUSTOMERS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "5. Mijozlar (Customers)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# Left side — description
add_text(slide, Inches(0.8), Inches(1.5), Inches(6), Inches(0.4),
         "\"Клиенты\" bo'limida barcha mijozlaringizni boshqaring:", font_size=14, color=DARK)

features_left = [
    "Mijoz qo'shish: Ism, telefon, email",
    "Mijoz tarixini ko'rish: barcha xaridlar, to'lovlar",
    "Nasiya (qarz) holati: qancha qarz bor",
    "Mijoz kartasi: umumiy xarid summasi",
    "Ism yoki telefon bo'yicha tezkor qidiruv",
    "Filtr: Barcha / Qarzdorlar / Faol",
    "Eksport: CSV yoki Excel",
]

y = Inches(2.1)
for item in features_left:
    add_text(slide, Inches(1.1), y, Inches(5.5), Inches(0.3),
             f"  {item}", font_size=12, color=DARK)
    y += Inches(0.35)

# Right side — customer card mockup
add_rounded_shape(slide, Inches(7.5), Inches(1.5), Inches(5), Inches(5.5), fill_color=WHITE, border_color=BORDER)
add_shape(slide, Inches(7.5), Inches(1.5), Inches(5), Inches(0.5), fill_color=PRIMARY)
add_text(slide, Inches(7.7), Inches(1.57), Inches(4.6), Inches(0.35),
         "Mijoz kartasi", font_size=14, color=WHITE, bold=True)

# Avatar circle
avatar = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.5), Inches(2.3), Inches(0.8), Inches(0.8))
avatar.fill.solid()
avatar.fill.fore_color.rgb = PRIMARY_LIGHT
avatar.line.fill.background()
add_text(slide, Inches(9.5), Inches(2.45), Inches(0.8), Inches(0.5),
         "AA", font_size=18, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)

customer_info = [
    ("Ism:", "Aliyeva Aziza"),
    ("Tel:", "+998 90 123 45 67"),
    ("Email:", "aziza@gmail.com"),
    ("Jami xarid:", "4,500,000 so'm"),
    ("Nasiya:", "250,000 so'm"),
    ("Oxirgi tashrif:", "2026-05-10"),
]
y = Inches(3.3)
for label, value in customer_info:
    add_text(slide, Inches(7.9), y, Inches(1.5), Inches(0.3), label, font_size=11, color=MEDIUM, bold=True)
    add_text(slide, Inches(9.4), y, Inches(2.8), Inches(0.3), value, font_size=11, color=DARK)
    y += Inches(0.33)


# ═══════════════════════════════════════════════════
# SLIDE 9: WORKERS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "6. Xodimlar (Workers)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# Roles table
add_text(slide, Inches(0.8), Inches(1.5), Inches(5), Inches(0.4),
         "Rollar va vakolatlar:", font_size=16, color=DARK, bold=True)

make_table_card(slide, Inches(0.8), Inches(2.0), Inches(6), [
    ["Rol", "Daraja", "Asosiy vakolat"],
    ["Owner", "5 (max)", "Barcha huquqlar, moliya, sozlamalar"],
    ["Admin", "4", "Xodimlar, katalog, hisobot"],
    ["Manager", "3", "Filial boshqaruvi, kassa"],
    ["Cashier", "2", "Faqat kassa va sotuvlar"],
    ["Viewer", "1 (min)", "Faqat ko'rish (read-only)"],
], col_widths=[Inches(1.5), Inches(1.2), Inches(3.3)])

# Worker management features
add_text(slide, Inches(7.5), Inches(1.5), Inches(5), Inches(0.4),
         "Xodim boshqaruvi:", font_size=16, color=DARK, bold=True)

worker_features = [
    "Xodim qo'shish: Ism, email, telefon, rol",
    "Filialga biriktirish (bir nechta mumkin)",
    "Parol berish va tiklash",
    "Xodimni bloklash / faollashtirish",
    "Oxirgi kirish vaqtini ko'rish",
    "Smena tarixi: qachon ishlagan",
    "Xodim bo'yicha sotuv hisoboti",
]

y = Inches(2.1)
for item in worker_features:
    add_text(slide, Inches(7.7), y, Inches(5), Inches(0.3),
             f"  {item}", font_size=12, color=DARK)
    y += Inches(0.38)

# Note box
note = add_rounded_shape(slide, Inches(0.8), Inches(5.5), Inches(11.7), Inches(1.2), fill_color=RGBColor(0xFF, 0xFB, 0xEB), border_color=WARNING)
add_text(slide, Inches(1.0), Inches(5.65), Inches(11.3), Inches(0.3),
         "Muhim eslatma:", font_size=13, color=WARNING, bold=True)
add_text(slide, Inches(1.0), Inches(6.0), Inches(11.3), Inches(0.5),
         "Har bir xodim faqat o'ziga tegishli filiallar ma'lumotlarini ko'radi. Boshqa filial ma'lumotlariga kirish TAQIQLANGAN (multi-tenant izolyatsiya).",
         font_size=12, color=DARK)


# ═══════════════════════════════════════════════════
# SLIDE 10: SALES & POS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "7. Sotuvlar va Kassa (POS)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# POS Features
pos_cards = [
    ("Buyurtmalar", "Barcha sotuvlar ro'yxati. Sana, mijoz, summa, holat ko'rinadi. Filtr: bugun, hafta, oy.", SUCCESS),
    ("Qaytarishlar", "Mijoz tovarni qaytarsa — sabab va miqdor kiritiladi. Ombor avtomatik yangilanadi.", DANGER),
    ("Smenalar", "Kassir smena ochadi va yopadi. Smena hisoboti: naqd, terminal, jami.", PRIMARY_LIGHT),
    ("To'lov usullari", "Naqd, terminal, Click, Payme. Bir buyurtma uchun bir nechta usul (split payment).", ACCENT),
]

for i, (title, desc, color) in enumerate(pos_cards):
    x = Inches(0.6) + Inches(3.15) * i
    y = Inches(1.5)
    card = add_rounded_shape(slide, x, y, Inches(2.95), Inches(2.2), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(2.95), Inches(0.06), fill_color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.2), Inches(2.5), Inches(0.4),
             title, font_size=15, color=color, bold=True)
    add_text(slide, x + Inches(0.2), y + Inches(0.6), Inches(2.5), Inches(1.4),
             desc, font_size=11, color=DARK)

# POS workflow
add_text(slide, Inches(0.8), Inches(4.0), Inches(5), Inches(0.4),
         "Kassa (POS Desktop) ishlash tartibi:", font_size=16, color=DARK, bold=True)

steps = [
    ("1", "Smena oching", "Kassir \"Смена открыть\" tugmasini bosadi"),
    ("2", "Tovar qo'shing", "Shtrix-kod skanerlang yoki qidiring"),
    ("3", "Miqdor kiriting", "Har tovar uchun miqdorni belgilang"),
    ("4", "To'lov tanlang", "Naqd, terminal, yoki aralash"),
    ("5", "Chek chiqaring", "Printer orqali chek chop etiladi"),
    ("6", "Smena yoping", "Kun oxirida smena hisoboti ko'ring"),
]

for i, (num, title, desc) in enumerate(steps):
    x = Inches(0.8) + Inches(2.05) * i
    y = Inches(4.6)
    # Step number
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.65), y, Inches(0.5), Inches(0.5))
    circle.fill.solid()
    circle.fill.fore_color.rgb = PRIMARY
    circle.line.fill.background()
    tf = circle.text_frame
    tf.paragraphs[0].text = num
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = WHITE
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    add_text(slide, x + Inches(0.1), y + Inches(0.65), Inches(1.8), Inches(0.3),
             title, font_size=12, color=DARK, bold=True, alignment=PP_ALIGN.CENTER)
    add_text(slide, x + Inches(0.05), y + Inches(0.95), Inches(1.9), Inches(0.6),
             desc, font_size=9, color=MEDIUM, alignment=PP_ALIGN.CENTER)

# Arrow connectors between steps
for i in range(5):
    x = Inches(2.35) + Inches(2.05) * i
    add_text(slide, x, Inches(4.7), Inches(0.3), Inches(0.3),
             ">", font_size=18, color=PRIMARY_LIGHT, bold=True, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════
# SLIDE 11: REPORTS & ANALYTICS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "8. Hisobotlar va Analitika", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

reports = [
    ("Kunlik tushum", "Har kungi sotuv summasi grafik va jadval ko'rinishida. Filial bo'yicha filtrlash mumkin."),
    ("Top mahsulotlar", "Eng ko'p sotilgan tovarlar reytingi. Oy yoki hafta bo'yicha ko'rish."),
    ("Filial taqqoslash", "Filiallarni sotuv, tushum, buyurtmalar bo'yicha solishtirish."),
    ("Smena hisoboti", "Har smena uchun: naqd, terminal, jami. Kassir bo'yicha batafsil."),
    ("Foyda va zarar (P&L)", "Tushum minus xarajatlar = sof foyda. Oylik va yillik ko'rinish."),
    ("Konstruktor", "O'zingiz xohlagan hisobotni yarating. Filtrlar va ustunlarni tanlang."),
]

for i, (title, desc) in enumerate(reports):
    col = i % 3
    row = i // 3
    x = Inches(0.6) + Inches(4.1) * col
    y = Inches(1.5) + Inches(2.9) * row
    card = add_rounded_shape(slide, x, y, Inches(3.9), Inches(2.5), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(3.9), Inches(0.06), fill_color=PRIMARY_LIGHT)
    add_text(slide, x + Inches(0.25), y + Inches(0.25), Inches(3.4), Inches(0.4),
             title, font_size=15, color=PRIMARY, bold=True)
    add_text(slide, x + Inches(0.25), y + Inches(0.7), Inches(3.4), Inches(1.5),
             desc, font_size=12, color=DARK)


# ═══════════════════════════════════════════════════
# SLIDE 12: NASIYA & CHEGIRMA
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "9. Moliya — Nasiya va Chegirmalar", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

# Nasiya
make_card(slide, Inches(0.8), Inches(1.5), Inches(5.8), Inches(5.5),
          "Nasiya (Qarz boshqaruvi)", [
              "Mijozga nasiyaga tovar berish",
              "Qarz summasi va to'lov muddati",
              "Qisman to'lovlarni qabul qilish",
              "Muddati o'tgan qarzlar ogohlantirishi",
              "Mijoz bo'yicha qarz tarixi",
              "SMS/Telegram orqali eslatma yuborish",
              "Hisobot: jami nasiya, to'langan, qolgan",
          ], icon="")

# Chegirma
make_card(slide, Inches(7.0), Inches(1.5), Inches(5.8), Inches(5.5),
          "Chegirmalar (Skidki)", [
              "Foizli chegirma: 5%, 10%, 20%...",
              "Summaviy chegirma: 10,000 so'm",
              "Aksiya: muddatli maxsus narxlar",
              "Promo-kod yaratish",
              "Kategoriya bo'yicha chegirma",
              "Minimal xarid summasi sharti",
              "Statistika: qancha chegirma berildi",
          ], icon="")


# ═══════════════════════════════════════════════════
# SLIDE 13: REAL ESTATE
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "10. Ko'chmas mulk (Real Estate)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

re_features = [
    ("Mulklar ro'yxati", "Barcha ko'chmas mulklaringiz: kvartira, do'kon, ofis. Manzil, maydoni, holati.", PRIMARY_LIGHT),
    ("Ijara shartnomalar", "Har mulk uchun ijarachi, summa, muddat. Shartnoma boshlanish/tugash sanasi.", SUCCESS),
    ("To'lov jadvali", "Oylik to'lovlar ko'rinishi. Kutilayotgan, to'langan, muddati o'tgan.", WARNING),
    ("ROI hisoblash", "Daromadlilik foizi. Xarajatlar vs tushum. Investitsiya qoplash muddati.", ACCENT),
]

for i, (title, desc, color) in enumerate(re_features):
    x = Inches(0.6) + Inches(3.15) * i
    y = Inches(1.5)
    card = add_rounded_shape(slide, x, y, Inches(2.95), Inches(2.5), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(2.95), Inches(0.06), fill_color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.2), Inches(2.5), Inches(0.4),
             title, font_size=14, color=color, bold=True)
    add_text(slide, x + Inches(0.2), y + Inches(0.6), Inches(2.5), Inches(1.6),
             desc, font_size=11, color=DARK)

# Property card mockup
add_rounded_shape(slide, Inches(0.8), Inches(4.3), Inches(11.7), Inches(2.8), fill_color=WHITE, border_color=BORDER)
add_shape(slide, Inches(0.8), Inches(4.3), Inches(11.7), Inches(0.5), fill_color=PRIMARY)
add_text(slide, Inches(1.0), Inches(4.37), Inches(3), Inches(0.35),
         "Mulk kartasi — namuna", font_size=14, color=WHITE, bold=True)

prop_info = [
    ("Nomi:", "Toshkent, Chilonzor 9, 45-uy"),
    ("Turi:", "Do'kon (50 m2)"),
    ("Ijarachi:", "Aliyev Sardor"),
    ("Oylik ijara:", "3,000,000 so'm"),
    ("Shartnoma:", "01.01.2026 — 31.12.2026"),
    ("Holat:", "Faol (to'lov kutilmoqda)"),
]

for i, (label, value) in enumerate(prop_info):
    col = i % 3
    row = i // 3
    x = Inches(1.0) + Inches(4.0) * col
    y = Inches(5.0) + Inches(0.6) * row
    add_text(slide, x, y, Inches(1.3), Inches(0.3), label, font_size=11, color=MEDIUM, bold=True)
    add_text(slide, x + Inches(1.3), y, Inches(2.5), Inches(0.3), value, font_size=11, color=DARK)


# ═══════════════════════════════════════════════════
# SLIDE 14: SETTINGS
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "11. Sozlamalar (Settings)", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

settings = [
    ("Foydalanuvchilar", [
        "Yangi foydalanuvchi qo'shish",
        "Rol va filial biriktirish",
        "Parol tiklash",
        "Bloklash / aktivlashtirish",
    ], PRIMARY_LIGHT),
    ("Filiallar", [
        "Yangi filial qo'shish",
        "Manzil va ish vaqti",
        "Filialga xodim biriktirish",
        "Filial bo'yicha hisobot",
    ], SUCCESS),
    ("Printer", [
        "Chek printer sozlamalari",
        "Printer turi tanlash",
        "Test chek chiqarish",
        "Chek shabloni tahrirlash",
    ], ACCENT),
    ("Audit jurnal", [
        "Barcha amallar logi",
        "Kim, qachon, nima qildi",
        "Sana bo'yicha filtr",
        "Eksport imkoniyati",
    ], WARNING),
]

for i, (title, items, color) in enumerate(settings):
    x = Inches(0.6) + Inches(3.15) * i
    y = Inches(1.5)
    card = add_rounded_shape(slide, x, y, Inches(2.95), Inches(3.0), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(2.95), Inches(0.5), fill_color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.1), Inches(2.5), Inches(0.35),
             title, font_size=14, color=WHITE, bold=True)
    yy = y + Inches(0.7)
    for item in items:
        add_text(slide, x + Inches(0.25), yy, Inches(2.5), Inches(0.3),
                 f"  {item}", font_size=11, color=DARK)
        yy += Inches(0.35)

# Billing + Language
add_text(slide, Inches(0.8), Inches(4.8), Inches(5), Inches(0.4),
         "Qo'shimcha sozlamalar:", font_size=14, color=DARK, bold=True)

extra = [
    "Billing — tarif rejasi va to'lov holati",
    "Til — O'zbekcha, Ruscha, English",
    "Valyuta kurslari — USD, EUR, RUB avtomatik yangilanadi",
    "Parol o'zgartirish — profil sozlamalari orqali",
]
y = Inches(5.3)
for item in extra:
    add_text(slide, Inches(1.0), y, Inches(10), Inches(0.3),
             f"  {item}", font_size=12, color=DARK)
    y += Inches(0.35)


# ═══════════════════════════════════════════════════
# SLIDE 15: DAILY WORKFLOW
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, Inches(1.2), fill_color=PRIMARY)
add_text(slide, Inches(0.8), Inches(0.3), Inches(8), Inches(0.7),
         "12. Kundalik ish tartibi", font_size=28, color=WHITE, bold=True)
add_shape(slide, Inches(0), Inches(0), Inches(0.1), Inches(1.2), fill_color=ACCENT)

workflows = [
    ("Ertalab", SUCCESS, [
        "Tizimga kiring",
        "Dashboard tekshiring",
        "Kam qolgan tovarlarni ko'ring",
        "Smena oching (kassir)",
    ]),
    ("Kun davomida", PRIMARY_LIGHT, [
        "Mijozlarga xizmat ko'rsating",
        "Sotuvlarni amalga oshiring",
        "Yangi tovar kelsa — kirim qiling",
        "Nasiya to'lovlarni qabul qiling",
    ]),
    ("Kechqurun", WARNING, [
        "Smena yoping",
        "Smena hisobotini tekshiring",
        "Naqd pulni sanang",
        "Ombor qoldiqlarini tekshiring",
    ]),
    ("Hafta oxiri", ACCENT, [
        "Haftalik hisobotni ko'ring",
        "Top mahsulotlar tahlili",
        "Kam qolgan tovarlar buyurtmasi",
        "Xodimlar ish grafigi rejasi",
    ]),
]

for i, (title, color, items) in enumerate(workflows):
    x = Inches(0.6) + Inches(3.15) * i
    y = Inches(1.5)
    card = add_rounded_shape(slide, x, y, Inches(2.95), Inches(3.5), fill_color=WHITE, border_color=BORDER)
    add_shape(slide, x, y, Inches(2.95), Inches(0.5), fill_color=color)
    add_text(slide, x + Inches(0.2), y + Inches(0.1), Inches(2.5), Inches(0.35),
             title, font_size=15, color=WHITE, bold=True)

    yy = y + Inches(0.7)
    for item in items:
        add_text(slide, x + Inches(0.2), yy, Inches(2.5), Inches(0.35),
                 f"  {item}", font_size=11, color=DARK)
        yy += Inches(0.4)

# FAQ
add_text(slide, Inches(0.8), Inches(5.3), Inches(5), Inches(0.4),
         "Tez-tez so'raladigan savollar:", font_size=14, color=DARK, bold=True)

make_table_card(slide, Inches(0.8), Inches(5.8), Inches(11.7), [
    ["Savol", "Javob"],
    ["Parolni unutdim?", "Administratorga murojaat qiling — u tiklaydi."],
    ["Tovar qo'sha olmayapman?", "Kategoriya va birlik (unit) majburiy. Avval ularni qo'shing."],
    ["Chek chiqmayapti?", "Sozlamalar > Printer bo'limida printer ulanganini tekshiring."],
    ["Boshqa filial ma'lumoti ko'rinmaydi?", "Siz faqat o'z filialingiz ma'lumotlarini ko'rasiz. Bu xavfsizlik."],
], col_widths=[Inches(4), Inches(7.7)])


# ═══════════════════════════════════════════════════
# SLIDE 16: CLOSING
# ═══════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_shape(slide, Inches(0), Inches(0), SLIDE_WIDTH, SLIDE_HEIGHT, fill_color=PRIMARY)
add_shape(slide, Inches(0), Inches(0), Inches(0.15), SLIDE_HEIGHT, fill_color=ACCENT)
add_shape(slide, Inches(0), Inches(6.5), SLIDE_WIDTH, Inches(1), fill_color=RGBColor(0x15, 0x30, 0x8A))

# Logo
add_rounded_shape(slide, Inches(5.5), Inches(1.5), Inches(2.3), Inches(2.3), fill_color=WHITE)
add_text(slide, Inches(5.5), Inches(1.8), Inches(2.3), Inches(1.5), "RAOS", font_size=48, color=PRIMARY, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(5.5), Inches(3.0), Inches(2.3), Inches(0.4), "v3.0", font_size=16, color=MEDIUM, alignment=PP_ALIGN.CENTER)

add_text(slide, Inches(1), Inches(4.2), Inches(11.3), Inches(0.6),
         "Savollar bo'lsa — administratorga murojaat qiling", font_size=24, color=WHITE, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(4.9), Inches(11.3), Inches(0.5),
         "Telegram: @raos_support  |  Email: support@raos.uz", font_size=16, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(1), Inches(5.6), Inches(11.3), Inches(0.4),
         "Retail & Asset Operating System", font_size=14, color=RGBColor(0xBF, 0xDB, 0xFE), alignment=PP_ALIGN.CENTER)

# Footer
add_text(slide, Inches(1), Inches(6.7), Inches(11.3), Inches(0.4),
         "RAOS  2025-2026. Barcha huquqlar himoyalangan.", font_size=12, color=RGBColor(0x93, 0xC5, 0xFD), alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════
output_path = os.path.join(os.path.dirname(__file__), "RAOS_Admin_Panel_Guide.pptx")
prs.save(output_path)
print(f"Presentation saved to: {output_path}")
print(f"Total slides: {len(prs.slides)}")

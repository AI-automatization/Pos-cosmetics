import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0E1530] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-[#24D4F4] font-bold text-8xl mb-4">404</p>
        <h1 className="text-white font-bold text-2xl mb-3">Sahifa topilmadi</h1>
        <p className="text-slate-400 mb-8">Siz izlayotgan sahifa mavjud emas.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold px-6 py-3 rounded-xl hover:bg-[#0FA8C8] transition-colors"
        >
          <ArrowLeft size={16} />
          Bosh sahifaga
        </a>
      </div>
    </main>
  )
}

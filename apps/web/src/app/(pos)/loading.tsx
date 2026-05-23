import Image from 'next/image';

export default function PosLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-raos-bg-deep">
      <div className="flex flex-col items-center gap-4">
        {/* RAOS canonical cyan icon — branded loader on POS dark shell */}
        <div className="inline-flex h-12 w-12 overflow-hidden rounded-2xl shadow-lg shadow-raos-cyan/30 ring-1 ring-raos-cyan/30">
          <Image src="/icon.png" alt="RAOS" width={48} height={48} priority />
        </div>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-raos-bg-highlight border-t-raos-cyan" />
        <p className="text-sm text-gray-400">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

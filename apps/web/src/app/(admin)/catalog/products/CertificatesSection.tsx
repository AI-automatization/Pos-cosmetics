'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck, Plus, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { catalogApi } from '@/api/catalog.api';
import { cn } from '@/lib/utils';
import type { ProductCertificate, CreateCertificateDto } from '@/types/catalog';

interface CertificatesSectionProps {
  productId: string;
}

const CERTS_KEY = (id: string) => ['product-certificates', id];

function useCertificates(productId: string) {
  return useQuery({
    queryKey: CERTS_KEY(productId),
    queryFn: () => catalogApi.getCertificates(productId),
    staleTime: 60_000,
  });
}

function useCreateCertificate(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCertificateDto) => catalogApi.createCertificate(productId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CERTS_KEY(productId) });
      toast.success("Sertifikat qo'shildi");
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}

function useDeleteCertificate(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certId: string) => catalogApi.deleteCertificate(productId, certId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CERTS_KEY(productId) });
      toast.success("Sertifikat o'chirildi");
    },
    onError: () => toast.error("Xato yuz berdi"),
  });
}

function isExpiringSoon(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 kun
}

function isExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export function CertificatesSection({ productId }: CertificatesSectionProps) {
  const { data: certs = [], isLoading } = useCertificates(productId);
  const { mutate: deleteCert } = useDeleteCertificate(productId);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="col-span-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-emerald-900">Sertifikatlar</h4>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Qo&apos;shish
        </button>
      </div>

      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 flex-1 animate-pulse rounded-lg bg-emerald-100" />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <p className="py-4 text-center text-xs text-emerald-400">
          Sertifikatlar hali qo&apos;shilmagan
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {certs.map((cert) => (
            <CertRow key={cert.id} cert={cert} onDelete={deleteCert} />
          ))}
        </div>
      )}

      {showForm && (
        <CertForm
          productId={productId}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function CertRow({
  cert,
  onDelete,
}: {
  cert: ProductCertificate;
  onDelete: (id: string) => void;
}) {
  const expired = isExpired(cert.expiresAt);
  const expiring = isExpiringSoon(cert.expiresAt);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className={cn(
      'flex items-center justify-between rounded-lg bg-white px-3 py-2.5',
      expired && 'ring-1 ring-red-300',
      expiring && !expired && 'ring-1 ring-yellow-300',
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{cert.certNumber}</p>
          {expired && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
              <AlertTriangle className="h-2.5 w-2.5" />
              Muddati o&apos;tgan
            </span>
          )}
          {expiring && !expired && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
              <AlertTriangle className="h-2.5 w-2.5" />
              Tugayapti
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {cert.issuingAuthority} | {fmtDate(cert.issuedAt)}
          {cert.expiresAt && ` — ${fmtDate(cert.expiresAt)}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {cert.fileUrl && (
          <a
            href={cert.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onDelete(cert.id)}
          className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function CertForm({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const { mutate: create, isPending } = useCreateCertificate(productId);
  const [form, setForm] = useState<CreateCertificateDto>({
    certNumber: '',
    issuingAuthority: '',
    issuedAt: new Date().toISOString().slice(0, 10),
    expiresAt: '',
    fileUrl: '',
  });

  const canSubmit = form.certNumber && form.issuingAuthority && form.issuedAt;

  const handleSubmit = () => {
    if (!canSubmit) return;
    create(
      { ...form, expiresAt: form.expiresAt || undefined, fileUrl: form.fileUrl || undefined },
      { onSuccess: onClose },
    );
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Sertifikat raqami *</label>
          <input
            value={form.certNumber}
            onChange={(e) => setForm((f) => ({ ...f, certNumber: e.target.value }))}
            placeholder="CERT-2024-001234"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Bergan organ *</label>
          <input
            value={form.issuingAuthority}
            onChange={(e) => setForm((f) => ({ ...f, issuingAuthority: e.target.value }))}
            placeholder="O'zstandard"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Berilgan sana *</label>
          <input
            type="date"
            value={form.issuedAt}
            onChange={(e) => setForm((f) => ({ ...f, issuedAt: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Amal qilish muddati</label>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-600">Fayl URL (ixtiyoriy)</label>
          <input
            value={form.fileUrl}
            onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? 'Saqlanmoqda...' : "Qo'shish"}
        </button>
      </div>
    </div>
  );
}

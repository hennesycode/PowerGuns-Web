"use client";

import { useState } from "react";

interface DeleteServiceModalProps {
  serviceName: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteServiceModal({
  serviceName,
  onCancel,
  onConfirm,
}: DeleteServiceModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#171513] border border-[#c4871a]/20 p-6 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#B63A2B]/10 border border-[#B63A2B]/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#B63A2B" strokeWidth="1.5" className="w-7 h-7">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h2 className="font-heading font-bold text-lg text-white text-center uppercase tracking-[.04em] mb-2">
          Eliminar servicio
        </h2>
        <p className="text-[#B2AAA7] text-sm text-center mb-2">
          ¿Seguro que deseas eliminar este servicio?
        </p>
        <p className="text-[#c4871a] font-['Rajdhani',sans-serif] font-semibold text-sm text-center mb-1">
          {serviceName}
        </p>
        <p className="text-[#5B5A59] text-xs text-center">
          Esta acción eliminará el servicio y sus imágenes asociadas. No se podrá recuperar.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-[#3C3A37] text-[#B2AAA7] hover:text-white hover:border-[#5B5A59] transition-colors font-['Rajdhani',sans-serif] font-semibold text-sm uppercase tracking-[.06em] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-[#B63A2B] text-white hover:bg-[#9e3224] transition-colors font-['Rajdhani',sans-serif] font-semibold text-sm uppercase tracking-[.06em] disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sí, eliminar servicio"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

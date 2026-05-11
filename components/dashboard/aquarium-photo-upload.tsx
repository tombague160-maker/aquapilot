"use client";

import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, RefreshCw, UploadCloud } from "lucide-react";

type AquariumPhotoUploadProps = {
  aquariumId: string;
  hasPhoto: boolean;
};

export function AquariumPhotoUpload({
  aquariumId,
  hasPhoto,
}: AquariumPhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`/api/aquariums/${aquariumId}/photo`, {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      setError(payload.error ?? "Upload impossible pour le moment.");
      setIsUploading(false);
      return;
    }

    setMessage("Photo ajoutee au rendu vivant.");
    setIsUploading(false);
    router.refresh();
  }

  return (
    <div className="rounded-[1.35rem] border border-cyan-100/12 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1rem] border border-cyan-200/16 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-50 shadow-[0_14px_32px_rgba(8,145,178,0.12)] transition hover:border-cyan-200/28 hover:bg-cyan-300/16 disabled:cursor-wait disabled:opacity-70"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : hasPhoto ? (
          <RefreshCw className="size-4" aria-hidden="true" />
        ) : (
          <UploadCloud className="size-4" aria-hidden="true" />
        )}
        {isUploading
          ? "Upload en cours"
          : hasPhoto
            ? "Remplacer la photo"
            : "Ajouter une photo de mon bac"}
      </button>
      {previewUrl ? (
        <div className="mt-3 flex items-center gap-3 rounded-[1rem] border border-cyan-100/10 bg-slate-950/42 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="size-12 rounded-xl object-cover"
          />
          <p className="text-xs leading-5 text-slate-300">
            La photo est stylisee avec un filtre aquatique et des animations.
          </p>
        </div>
      ) : (
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
          <Camera className="mt-0.5 size-3.5 shrink-0 text-cyan-200" />
          JPG, PNG ou WebP. AquaPilot garde la photo en local et ajoute les
          effets visuels par-dessus.
        </p>
      )}
      {message ? <p className="mt-2 text-xs text-emerald-200">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-200">{error}</p> : null}
    </div>
  );
}

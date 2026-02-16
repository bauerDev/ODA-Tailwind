"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

type AnalysisResult = {
    title?: string | null;
    author?: string | null;
    year?: string | null;
    movement?: string | null;
    technique?: string | null;
    dimensions?: string | null;
    location?: string | null;
    description?: string | null;
    characters?: { name: string; role: string }[];
    image_url?: string | null;
};

export default function Reconocimiento() {
    const router = useRouter();
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        // Validate mime quickly on client
        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!ALLOWED.includes(f.type)) {
            setError('Tipo de archivo no soportado. Usa JPG, PNG, WEBP o GIF.');
            return;
        }
        setFileObj(f);
        const url = URL.createObjectURL(f);
        setFilePreview(url);
        setResult(null);
        setError(null);
    }

    async function analyze() {
        if (!fileObj) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            // compress iteratively to keep payload small for model (try under 200KB)
            const compressed = await compressUntilUnder(fileObj, 250 * 1024);
            const form = new FormData();
            form.append('image', compressed, compressed.name || fileObj.name);
            const res = await fetch('/api/ai-recognition', {
                method: 'POST',
                body: form,
            });
            if (!res.ok) {
                // try to parse structured JSON error
                let bodyText = await res.text();
                try {
                    const j = JSON.parse(bodyText);
                    bodyText = j.error || j.message || bodyText;
                    if (j.suggestion) bodyText += ' — ' + j.suggestion;
                } catch (e) {
                    // keep raw
                }
                throw new Error(bodyText || 'API error');
            }
            const data = await res.json();

            // create image data URL as fallback if needed
            let imgDataUrl: string | null = null;
            try {
                const reader = new FileReader();
                imgDataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onerror = () => reject(new Error('Failed to read image'));
                    reader.onload = () => resolve(String(reader.result ?? ''));
                    reader.readAsDataURL(compressed);
                });
            } catch (e) {
                // ignore
            }

            // Expect the API (GPT) to return the structured JSON with keys in English.
            let final: any = data;
            if (data && typeof data.raw === 'string') {
                try {
                    final = JSON.parse(data.raw);
                } catch (e) {
                    final = data;
                }
            }

            if (!final || typeof final !== 'object') {
                throw new Error('AI returned an unexpected response');
            }

            // ensure image_url exists
            final.image_url = final.image_url ?? filePreview ?? imgDataUrl ?? null;

            setResult(final);
            try {
                sessionStorage.setItem('ai:recognition:result', JSON.stringify(final));
                if (imgDataUrl) sessionStorage.setItem('ai:recognition:image', imgDataUrl);
            } catch (e) {
                console.warn('Could not save recognition result to sessionStorage', e);
            }

            router.push('/artwork/preview');
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    function removeImage() {
        setFileObj(null);
        setFilePreview(null);
        setResult(null);
        setError(null);
    }

    return (
        <>
            <section className="bg-(--card) py-(--spacing-2xl)">
                <div className="mx-auto w-full max-w-[1280px] px-4">
                    <div className="text-center">
                        <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
                            Artificial Intelligence Recognition
                        </h1>
                        <p className="mx-auto my-0 max-w-3xl text-lg text-(--muted-foreground)">
                            Sube una imagen de una obra y la IA intentará identificar todos los
                            campos disponibles: título, autor, año, movimiento, técnica,
                            dimensiones, ubicación, descripción (personajes y rol) y URL de la
                            imagen.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-(--spacing-3xl)">
                <div className="mx-auto w-full max-w-[1280px] px-4">
                    <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2">
                        <div>
                            <div className="border border-(--border) bg-(--card) p-(--spacing-xl)">
                                <h2 className="mb-(--spacing-sm) font-(--font-family-heading) text-2xl">Upload an image</h2>
                                <p className="mb-(--spacing-lg) text-(--muted-foreground)">PNG, JPG, WEBP up to 10MB</p>

                                <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-(--border) bg-(--background) p-(--spacing-3xl) text-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        aria-label="Upload artwork image"
                                    />
                                    <div className="pointer-events-none">
                                        <p className="mb-(--spacing-sm) text-lg text-(--foreground)">
                                            <span className="font-medium text-(--primary)">Click to upload</span> or drag and drop
                                        </p>
                                    </div>
                                </div>

                                {filePreview && (
                                    <div className="mt-(--spacing-lg)">
                                        <div className="relative mb-(--spacing-md) w-full max-w-full overflow-hidden rounded-lg border border-(--border) bg-(--background)">
                                            <img src={filePreview} alt="Preview" className="block w-full max-h-[400px] object-contain" />
                                            <button onClick={removeImage} className="absolute right-(--spacing-md) top-(--spacing-md) flex h-10 w-10 items-center justify-center rounded-full bg-(--foreground) text-(--background)">X</button>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-(--spacing-lg) flex justify-center">
                                    <button onClick={analyze} disabled={!fileObj || loading} className="inline-flex items-center gap-(--spacing-sm) rounded-md bg-(--primary) px-(--spacing-2xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground)">
                                        {loading ? "Analyzing…" : "Analyze artwork"}
                                    </button>
                                </div>

                                {error && <p className="mt-(--spacing-md) text-sm text-red-500">{error}</p>}
                            </div>
                        </div>

                        <div>
                            <div className="flex min-h-[400px] flex-col border border-(--border) bg-(--card) p-(--spacing-xl)">
                                <h2 className="mb-(--spacing-lg) font-(--font-family-heading) text-2xl">Analysis results</h2>

                                {loading && (
                                    <div className="flex-1 flex-col items-center justify-center py-(--spacing-3xl)">
                                        <div className="mb-(--spacing-lg) h-12 w-12 animate-spin rounded-full border-4 border-(--muted) border-t-(--primary)"></div>
                                        <p className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">Analyzing image...</p>
                                    </div>
                                )}

                                {!loading && !result && (
                                    <div className="flex flex-1 flex-col items-center justify-center py-(--spacing-3xl) text-center">
                                        <p className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">Analysis results will appear here</p>
                                        <p className="max-w-[20rem] text-sm text-(--muted-foreground)">Upload an image and click "Analyze artwork" to begin</p>
                                    </div>
                                )}

                                {!loading && result && (
                                    <div className="flex-1">
                                        <div className="mb-(--spacing-xl)">
                                            <h3 className="mb-(--spacing-lg) border-b border-(--border) pb-(--spacing-sm) font-(--font-family-heading) text-xl">Artwork information</h3>
                                            <div className="grid grid-cols-1 gap-(--spacing-md)">
                                                <Field label="Title" value={result.title} />
                                                <Field label="Author" value={result.author} />
                                                <Field label="Year" value={result.year} />
                                                <Field label="Movement" value={result.movement} />
                                                <Field label="Technique" value={result.technique} />
                                                <Field label="Dimensions" value={result.dimensions} />
                                                <Field label="Location" value={result.location} />
                                            </div>
                                        </div>

                                        <div className="mb-(--spacing-xl) last:mb-0">
                                            <h3 className="mb-(--spacing-lg) border-b border-(--border) pb-(--spacing-sm) font-(--font-family-heading) text-xl">Description</h3>
                                            <div className="leading-relaxed text-(--muted-foreground)">
                                                <p>{result.description ?? "-"}</p>
                                                {result.characters && result.characters.length > 0 && (
                                                    <div className="mt-(--spacing-md)">
                                                        <h4 className="font-medium">Characters</h4>
                                                        <ul className="mt-(--spacing-sm) list-disc pl-(--spacing-lg)">
                                                            {result.characters.map((c, i) => (
                                                                <li key={i}>{c.name} — {c.role}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-(--spacing-xl) flex flex-wrap gap-(--spacing-md) border-t border-(--border) pt-(--spacing-xl)">
                                            <a href={result.image_url ?? filePreview ?? '#'} target="_blank" rel="noreferrer" className="inline-block min-w-[150px] flex-1 rounded-md bg-(--primary) px-(--spacing-lg) py-(--spacing-sm) text-center font-(--font-family-heading) text-(--primary-foreground)">Open image</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function Field({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-(--spacing-xs)">
            <span className="text-sm font-medium text-(--muted-foreground)">{label}:</span>
            <span className="text-base text-(--foreground)">{value ?? '-'}</span>
        </div>
    );
}

// Note: we send the image as multipart/form-data to the server, so no base64 helper is needed.

async function compressImage(file: File, maxSize = 1024, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Compression failed'));
                const newFile = new File([blob], file.name, { type: blob.type });
                resolve(newFile);
            }, 'image/jpeg', quality);
        };
        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(file);
    });
}

async function compressUntilUnder(file: File, maxBytes: number): Promise<File> {
    let quality = 0.8;
    let sizeLimit = 1024;
    let current = file;
    for (let i = 0; i < 4; i++) {
        const compressed = await compressImage(current, sizeLimit, quality);
        if (compressed.size <= maxBytes) return compressed;
        // tighten parameters for next iteration
        quality = Math.max(0.3, quality - 0.2);
        sizeLimit = Math.max(256, Math.floor(sizeLimit / 2));
        current = compressed;
    }
    // last attempt: make a small thumbnail 256x256 at low quality
    const thumb = await compressImage(current, 256, 0.5);
    return thumb;
}
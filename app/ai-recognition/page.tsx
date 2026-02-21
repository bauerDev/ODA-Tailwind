"use client";
import React, { useState } from "react";

export default function Reconocimiento() {
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!ALLOWED.includes(f.type)) {
            setError('Tipo de archivo no soportado. Usa JPG, PNG, WEBP o GIF.');
            return;
        }
        setFileObj(f);
        const url = URL.createObjectURL(f);
        setFilePreview(url);
        setError(null);
    }

    async function analyze() {
        if (!fileObj) return;
        setLoading(true);
        setError(null);
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
                const bodyText = await res.text();
                try {
                    const j = JSON.parse(bodyText);
                    const msg = j.error || j.message || bodyText;
                    throw new Error(j.suggestion ? `${msg} — ${j.suggestion}` : msg);
                } catch (e: unknown) {
                    if (e instanceof Error) throw e;
                    throw new Error(bodyText || 'API error');
                }
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

            if (!data || typeof data !== 'object') {
                throw new Error('AI returned an unexpected response');
            }

            const isArtwork = data.is_artwork === true || data.is_artwork === 'true';

            if (!isArtwork) {
                setError('No information was found about this artwork. The image might not depict a recognizable artwork.');
                return;
            }

            // Store image only in dedicated key: data URLs can be huge and hit sessionStorage limits in JSON
            const normalized = {
                is_artwork: true,
                title: data.title ?? null,
                author: data.author ?? null,
                year: data.year ?? null,
                movement: data.movement ?? null,
                technique: data.technique ?? null,
                dimensions: data.dimensions ?? null,
                location: data.location ?? null,
                description: data.description ?? null,
                image_url: data.image_url ?? null, // external URL only; our upload stays in ai:recognition:image
            };

            try {
                sessionStorage.setItem('ai:recognition:result', JSON.stringify(normalized));
                if (imgDataUrl) sessionStorage.setItem('ai:recognition:image', imgDataUrl);
            } catch (e) {
                console.warn('Could not save recognition result to sessionStorage', e);
            }

            // Full navigation so preview page reads sessionStorage reliably
            window.location.href = '/artwork/preview';
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    function removeImage() {
        setFileObj(null);
        setFilePreview(null);
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
                            Upload an image of an artwork and the AI will try to identify all
                            available fields: title, author, year, movement, technique,
                            dimensions, location, description (characters and role) and image URL.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-(--spacing-3xl)">
                <div className="mx-auto w-full max-w-[1280px] px-4">
                    <div className="w-full">
                        <div className="border border-(--border) bg-(--card) p-(--spacing-xl)">
                            <h2 className="mb-(--spacing-sm) font-(--font-family-heading) text-2xl">Upload an image</h2>
                            <p className="mb-(--spacing-lg) text-(--muted-foreground)">PNG, JPG, WEBP up to 10MB</p>

                            <div className="relative overflow-hidden rounded-none border-2 border-dashed border-(--border) bg-(--background) p-(--spacing-3xl) text-center">
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
                                    <div className="relative mb-(--spacing-md) w-full max-w-full overflow-hidden rounded-none border border-(--border) bg-(--background)">
                                        <img src={filePreview} alt="Preview" className="block w-full max-h-[400px] object-contain" />
                                        <button onClick={removeImage} className="absolute right-(--spacing-md) top-(--spacing-md) flex h-10 w-10 items-center justify-center rounded-none bg-(--foreground) text-(--background)">X</button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-(--spacing-lg) flex justify-center">
                                <button onClick={analyze} disabled={!fileObj || loading} className="inline-flex items-center gap-(--spacing-sm) rounded-none bg-(--primary) px-(--spacing-2xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground)">
                                    {loading ? "Analyzing…" : "Analyze artwork"}
                                </button>
                            </div>

                            {error && <p className="mt-(--spacing-md) text-sm text-red-500">{error}</p>}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

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
"use client";

/**
 * Cloudinary image upload component.
 * Used in /upload (admin-only protected route).
 * Shows drag & drop zone, upload/success/error states and resulting URL to copy.
 */
import { useState } from "react";
import Link from "next/link";

export default function UploadImage() {
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Converts an image file to WebP format */
  async function convertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      // If already WebP, return as is
      if (file.type === "image/webp") {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0);

          // Convert to WebP blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to convert image to WebP"));
                return;
              }
              
              // Create a new File object with WebP extension
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
                lastModified: Date.now(),
              });
              
              resolve(webpFile);
            },
            "image/webp",
            0.9 // Quality: 0.9 (90%) for good balance between quality and file size
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  /** Uploads file to Cloudinary with preset "oda-images" and updates state based on response */
  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    setResultUrl(null);
    
    try {
      // Convert to WebP before uploading
      const webpFile = await convertToWebP(file);
      
      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("upload_preset", "oda-images");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/do2td5gs1/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setResultUrl(data.secure_url);
      } else {
        setError(data.error?.message || "Error uploading image");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection error while uploading");
    } finally {
      setUploading(false);
    }
  }

  /** Starts upload when file is selected in the input */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    uploadImage(e.target.files[0]);
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4">
      {/* Header: page title and description */}
      <div className="text-center mb-(--spacing-2xl)">
        <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem] text-(--foreground)">
          Upload image
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
          Upload images to Cloudinary to use as URLs in gallery artworks. Admins only.
        </p>
      </div>

      {/* Main block: card with upload zone and results */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-none border border-(--border) bg-(--card) p-(--spacing-xl) shadow-lg shadow-black/5 transition-shadow hover:shadow-xl hover:shadow-black/10">
              <h2 className="mb-(--spacing-sm) font-(--font-family-heading) text-2xl text-(--foreground)">
                Select file
              </h2>
              <p className="mb-(--spacing-lg) text-(--muted-foreground)">
                Drag an image here or click to choose
              </p>

              {/* Label wrapping input: clickable zone with hover/uploading styles */}
              <label
                className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-none border-2 border-dashed p-(--spacing-3xl) text-center transition-all duration-200 ${
                  uploading
                    ? "cursor-not-allowed border-(--muted-foreground) bg-(--muted) opacity-80"
                    : "border-(--border) bg-(--background) hover:border-(--primary) hover:bg-[rgba(102,20,20,0.04)] hover:border-opacity-80"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={uploading}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
                {/* Visible zone content (icon + text); pointer-events-none so click reaches input */}
                <div className="pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`mx-auto mb-(--spacing-lg) h-16 w-16 ${uploading ? "text-(--muted-foreground) animate-pulse" : "text-(--muted-foreground)"}`}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="mb-(--spacing-sm) text-lg text-(--foreground)">
                    <span className="font-medium text-(--primary)">Click to upload</span> or drag
                  </p>
                  <p className="text-sm text-(--muted-foreground)">
                    PNG, JPG, WEBP (automatically converted to WebP)
                  </p>
                </div>
              </label>

              {/* Message while uploading */}
              {uploading && (
                <p className="mt-(--spacing-md) text-center text-sm text-(--muted-foreground)">
                  Converting to WebP and uploading…
                </p>
              )}

              {/* Error message if upload fails */}
              {error && (
                <div className="mt-(--spacing-lg) rounded-none border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              {/* After successful upload: show URL to copy and use in Admin when creating/editing artwork */}
              {resultUrl && (
                <div className="mt-(--spacing-lg) rounded-none border border-(--border) bg-(--muted) p-(--spacing-lg) shadow-inner">
                  <p className="mb-2 font-(--font-family-heading) text-sm text-(--foreground)">
                    Public URL:
                  </p>
                  <input
                    type="text"
                    readOnly
                    value={resultUrl}
                    className="w-full rounded-none border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                  />
                  <p className="mt-2 text-xs text-(--muted-foreground)">
                    Copy this URL and use it in the «Image URL» field when creating or editing an artwork in Admin.
                  </p>
                </div>
              )}

              {/* Link back to admin panel */}
              <div className="mt-(--spacing-xl) flex flex-wrap gap-(--spacing-md)">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-(--spacing-sm) rounded-none border border-(--border) bg-(--background) px-(--spacing-lg) py-(--spacing-sm) font-(--font-family-heading) text-(--foreground) transition-all duration-200 hover:bg-(--muted) hover:border-(--primary)/50"
                >
                  ← Back to Admin panel
                </Link>
              </div>
            </div>
          </div>
    </div>
  );
}

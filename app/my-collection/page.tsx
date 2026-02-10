'use client';

import { useState } from 'react';

export default function MiColeccion() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
        <section className="bg-(--card) py-(--spacing-2xl)">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                <div className="text-center">
                    <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">My Collection</h1>
                    <p className="mx-auto max-w-3xl text-lg text-(--muted-foreground)">
                        Create and manage your personalized collections of artworks. 
                        Organize your favorites by theme, period, or any criteria you prefer.
                    </p>
                </div>
            </div>
        </section>

        {/* Main Content */}
        <section className="py-(--spacing-3xl)">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                {/* Create Collection Card */}
                <div className="mb-(--spacing-3xl) rounded-lg border-2 border-dashed border-(--border) bg-(--card) p-(--spacing-3xl) text-center transition-all duration-200 hover:border-(--primary) hover:bg-[rgba(102,20,20,0.02)]">
                    <div className="mx-auto max-w-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-(--spacing-lg) h-12 w-12 text-(--primary)">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <h2 className="mb-(--spacing-md) font-(--font-family-heading) text-2xl">Create your first collection</h2>
                        <p className="mb-(--spacing-xl) leading-relaxed text-(--muted-foreground)">
                            Organize your favorite artworks into personalized thematic collections. 
                            Share your collections with other users or keep them private.
                        </p>
                        <button className="cursor-pointer rounded-md bg-(--primary) px-(--spacing-2xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)]" onClick={openModal}>
                            Create collection
                        </button>
                    </div>
                </div>

                {/* Collections Grid (Empty State) */}
                {/* TODO: Agregar bucle para recorrer las colecciones cuando existan */}
                <div className="grid grid-cols-1 gap-(--spacing-xl) sm:grid-cols-2 lg:grid-cols-3" id="colecciones-grid">
                    <div className="col-span-full rounded-lg border border-(--border) bg-(--card) px-(--spacing-xl) py-(--spacing-4xl) text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-(--spacing-lg) h-16 w-16 text-(--muted-foreground) opacity-50">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">
                            You haven&apos;t created any collections yet
                        </p>
                        <p className="text-sm text-(--muted-foreground)">
                            Click &quot;Create collection&quot; to get started
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Create Collection Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-(--spacing-lg)" onClick={closeModal}>
                <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-(--card) shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-(--border) p-(--spacing-xl)">
                    <h2 className="font-(--font-family-heading) text-2xl">Create new collection</h2>
                    <button className="flex cursor-pointer items-center justify-center border-0 bg-transparent p-(--spacing-xs) text-(--muted-foreground) transition-colors duration-200 hover:text-(--foreground)" onClick={closeModal} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form className="flex flex-col gap-(--spacing-lg) p-(--spacing-xl)" id="create-collection-form">
                    {/* Name */}
                    <div className="flex flex-col">
                        <label htmlFor="collection-name" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                            Collection name *
                        </label>
                        <input
                            type="text"
                            id="collection-name"
                            name="nombre"
                            className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                            placeholder="E.g.: Renaissance Works"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                        <label htmlFor="collection-description" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                            Description
                        </label>
                        <textarea
                            id="collection-description"
                            name="descripcion"
                            rows={4}
                            className="min-h-[100px] w-full resize-y border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)"
                            placeholder="Describe the theme or purpose of your collection..."
                        ></textarea>
                    </div>

                    {/* Visibility */}
                    <div className="flex flex-col">
                        <label htmlFor="collection-visibility" className="mb-(--spacing-xs) block font-(--font-family-heading) text-sm text-(--foreground)">
                            Visibility
                        </label>
                        <select id="collection-visibility" name="visibilidad" className="w-full border border-(--border) bg-(--card) px-4 py-2 font-inherit text-(--foreground) outline-none transition-colors duration-200 focus:border-(--primary)">
                            <option value="privada">Private (only you can see it)</option>
                            <option value="publica">Public (visible to everyone)</option>
                        </select>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-(--spacing-md) pt-(--spacing-md)">
                        <button type="button" className="flex-1 cursor-pointer rounded-md border border-(--border) bg-transparent px-(--spacing-lg) py-(--spacing-sm) font-(--font-family-heading) text-(--foreground) transition-all duration-200 hover:bg-(--muted)" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 cursor-pointer rounded-md border-0 bg-(--primary) px-(--spacing-lg) py-(--spacing-sm) font-(--font-family-heading) text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)]">
                            Create collection
                        </button>
                    </div>
                </form>
                </div>
            </div>
        )}
        </>
    )
}
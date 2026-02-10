export default function Reconocimiento() { 
    return (
        <>
        <section className="bg-(--card) py-(--spacing-2xl)">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                <div className="text-center">
                    <h1 className="mb-(--spacing-lg) font-(--font-family-heading) text-4xl md:text-[3rem]">
                        Artificial Intelligence Recognition
                    </h1>
                    <p className="mx-auto my-0 max-w-3xl text-lg text-(--muted-foreground)">
                        Upload an image of an artwork and our AI will analyze it to 
                        provide you with detailed information about the work, its author, artistic 
                        period, and historical context.
                    </p>
                </div>
            </div>
        </section>

        {/* Main Content */}
        <section className="py-(--spacing-3xl)">
            <div className="mx-auto w-full max-w-[1280px] px-4">
                <div className="grid grid-cols-1 gap-(--spacing-2xl) lg:grid-cols-2">
                    {/* Upload Area */}
                    <div>
                        <div className="border border-(--border) bg-(--card) p-(--spacing-xl)">
                            <h2 className="mb-(--spacing-sm) font-(--font-family-heading) text-2xl">Upload an image</h2>
                            <p className="mb-(--spacing-lg) text-(--muted-foreground)">
                                Drag an image here or click to select
                            </p>
                            
                            {/* Upload Zone */}
                            <div
                                className="relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-(--border) bg-(--background) p-(--spacing-3xl) text-center transition-all duration-200 hover:border-(--primary) hover:bg-[rgba(102,20,20,0.02)]"
                                id="upload-zone"
                            >
                                <input 
                                    type="file" 
                                    id="image-input" 
                                    name="image" 
                                    accept="image/*" 
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <div className="pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-(--spacing-lg) h-16 w-16 text-(--muted-foreground)">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <p className="mb-(--spacing-sm) text-lg text-(--foreground)">
                                        <span className="font-medium text-(--primary)">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-(--muted-foreground)">
                                        PNG, JPG, WEBP up to 10MB
                                    </p>
                                </div>
                            </div>

                            {/* Image Preview */}
                            <div className="mt-(--spacing-lg) hidden" id="image-preview-container">
                                <div className="relative mb-(--spacing-md) w-full max-w-full overflow-hidden rounded-lg border border-(--border) bg-(--background)">
                                    <img id="image-preview" alt="Preview" className="block w-full max-h-[400px] object-contain" />
                                    <button className="absolute right-(--spacing-md) top-(--spacing-md) flex h-10 w-10 items-center justify-center rounded-full bg-(--foreground) text-(--background) shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-110 hover:bg-[rgba(26,26,26,0.8)]" id="remove-image" aria-label="Remove image">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-center text-sm text-(--muted-foreground)" id="image-filename"></p>
                            </div>

                            {/* Analyze Button */}
                            <div className="mt-(--spacing-lg) flex justify-center">
                                <button className="inline-flex items-center gap-(--spacing-sm) rounded-md bg-(--primary) px-(--spacing-2xl) py-(--spacing-md) font-(--font-family-heading) text-lg text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)] disabled:cursor-not-allowed disabled:opacity-50" id="analyze-button" disabled>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    Analyze artwork
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div>
                        <div className="flex min-h-[400px] flex-col border border-(--border) bg-(--card) p-(--spacing-xl)">
                            <h2 className="mb-(--spacing-lg) font-(--font-family-heading) text-2xl">Analysis results</h2>
                            
                            {/* Loading State */}
                            <div className="hidden flex-1 flex-col items-center justify-center py-(--spacing-3xl)" id="results-loading">
                                <div className="mb-(--spacing-lg) h-12 w-12 animate-spin rounded-full border-4 border-(--muted) border-t-(--primary)"></div>
                                <p className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">Analyzing image...</p>
                                <p className="text-sm text-(--muted-foreground)">This may take a few seconds</p>
                            </div>

                            {/* Empty State */}
                            <div className="flex flex-1 flex-col items-center justify-center py-(--spacing-3xl) text-center" id="results-empty">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-(--spacing-lg) h-16 w-16 text-(--muted-foreground) opacity-50">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <p className="mb-(--spacing-sm) font-(--font-family-heading) text-lg text-(--foreground)">
                                    Analysis results will appear here
                                </p>
                                <p className="max-w-[20rem] text-sm text-(--muted-foreground)">
                                    Upload an image and click &quot;Analyze artwork&quot; to begin
                                </p>
                            </div>

                            {/* Results Content */}
                            {/* TODO: Agregar lógica condicional para mostrar/ocultar estados (loading, empty, content) */}
                            <div className="hidden flex-1" id="results-content">
                                {/* Artwork Info */}
                                <div className="mb-(--spacing-xl)">
                                    <h3 className="mb-(--spacing-lg) border-b border-(--border) pb-(--spacing-sm) font-(--font-family-heading) text-xl">Artwork information</h3>
                                    <div className="grid grid-cols-1 gap-(--spacing-md)">
                                        <div className="flex flex-col gap-(--spacing-xs)">
                                            <span className="text-sm font-medium text-(--muted-foreground)">Title:</span>
                                            <span className="text-base text-(--foreground)" id="result-titulo">-</span>
                                        </div>
                                        <div className="flex flex-col gap-(--spacing-xs)">
                                            <span className="text-sm font-medium text-(--muted-foreground)">Author:</span>
                                            <span className="text-base text-(--foreground)" id="result-autor">-</span>
                                        </div>
                                        <div className="flex flex-col gap-(--spacing-xs)">
                                            <span className="text-sm font-medium text-(--muted-foreground)">Year:</span>
                                            <span className="text-base text-(--foreground)" id="result-anio">-</span>
                                        </div>
                                        <div className="flex flex-col gap-(--spacing-xs)">
                                            <span className="text-sm font-medium text-(--muted-foreground)">Movement:</span>
                                            <span className="text-base text-(--foreground)" id="result-movimiento">-</span>
                                        </div>
                                        <div className="flex flex-col gap-(--spacing-xs)">
                                            <span className="text-sm font-medium text-(--muted-foreground)">Technique:</span>
                                            <span className="text-base text-(--foreground)" id="result-tecnica">-</span>
                                        </div>
                                        <div className="flex flex-col gap-(--spacing-xs)">
                                            <span className="text-sm font-medium text-(--muted-foreground)">Location:</span>
                                            <span className="text-base text-(--foreground)" id="result-ubicacion">-</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-(--spacing-xl) last:mb-0">
                                    <h3 className="mb-(--spacing-lg) border-b border-(--border) pb-(--spacing-sm) font-(--font-family-heading) text-xl">Description</h3>
                                    <div className="leading-relaxed text-(--muted-foreground)" id="result-descripcion">
                                        <p>-</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-(--spacing-xl) flex flex-wrap gap-(--spacing-md) border-t border-(--border) pt-(--spacing-xl)">
                                    <a href="/gallery" className="inline-block min-w-[150px] flex-1 rounded-md bg-(--primary) px-(--spacing-lg) py-(--spacing-sm) text-center font-(--font-family-heading) text-(--primary-foreground) transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(102,20,20,0.3)]" id="view-in-gallery">
                                        View in gallery
                                    </a>
                                    <button className="inline-block min-w-[150px] flex-1 rounded-md border border-(--primary) bg-transparent px-(--spacing-lg) py-(--spacing-sm) text-center font-(--font-family-heading) text-(--primary) transition-all duration-200 hover:bg-(--primary) hover:text-(--primary-foreground)" id="save-to-collection">
                                        Save to my collection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
}
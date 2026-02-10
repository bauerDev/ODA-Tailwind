export default function ManageArtworks() { 
    return (
        <>
            <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-[1280px] mx-auto">
                    <h1 className="text-4xl font-(--font-family-heading) text-(--foreground) mb-(--spacing-xl) text-center">Manage Artworks</h1>
                    <p className="text-lg text-(--muted-foreground) mb-(--spacing-2xl) text-center">Add, edit or delete artworks</p>
                    <div className="border border-(--border) overflow-x-auto">
                        <table className="w-full min-w-[800px] border-collapse text-(--foreground) bg-white">
                            <thead>
                                <tr className="bg-white text-(--foreground)">
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Title</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Author</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Year</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Movement</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Technique</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Dimensions</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Location</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Description</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Image</th>
                                    <th className="px-4 py-3 text-left font-(--font-family-heading) text-sm border-r border-b border-(--border)">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white [&>tr:hover]:bg-(--muted) [&_td]:px-4 [&_td]:py-3 [&_td]:text-(--foreground) [&_td]:border-r [&_td]:border-b [&_td]:border-(--border)">
                                {/* TODO: Add artworks */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </>
    )
}
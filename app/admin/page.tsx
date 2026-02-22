export default function AdminPage() {
    return (
        <>
            <section className="flex-1 flex flex-col items-center justify-center py-(--spacing-3xl)">
                <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-(--font-family-heading) text-(--foreground) mb-(--spacing-lg) sm:mb-(--spacing-xl) text-center">Admin Panel</h1>
                    <p className="text-base sm:text-lg text-(--muted-foreground) mb-(--spacing-xl) sm:mb-(--spacing-2xl) text-center px-2">Manage artworks, users and collections</p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-(--spacing-md) sm:gap-(--spacing-2xl) justify-center [&>a]:bg-(--primary) [&>a]:text-(--primary-foreground) [&>a]:px-(--spacing-xl) [&>a]:py-(--spacing-md) [&>a]:transition-all [&>a]:duration-(--transition-fast) [&>a]:hover:bg-[rgba(102,20,20,0.8)] [&>a]:cursor-pointer [&>a]:hover:text-(--primary-foreground) [&>a]:text-center [&>a]:rounded-none">
                        <a href="/admin/manage-artworks">
                            Manage Artworks
                        </a>
                        <a href="/admin/manage-users">
                            View Users
                        </a>
                        <a href="/admin/manage-collections">
                            View Collection
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
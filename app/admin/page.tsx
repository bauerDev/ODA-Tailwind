export default function AdminPage() {
    return (
        <>
            <section className="flex-1 flex flex-col items center justify-center">
                <div className="w-full max-w-[1280px] mx-auto">
                    <h1 className="text-4xl font-(--font-family-heading) text-(--foreground) mb-(--spacing-xl) text-center">Admin Panel</h1>
                    <p className="text-lg text-(--muted-foreground) mb-(--spacing-2xl) text-center">Manage artworks, users and collections</p>
                    <div className="flex gap-(--spacing-2xl) justify-center [&>a]:bg-(--primary) [&>a]:text-(--primary-foreground) [&>a]:px-(--spacing-2xl) [&>a]:py-(--spacing-md) [&>a]:transition-all [&>a]:duration-(--transition-fast) [&>a]:hover:bg-[rgba(102,20,20,0.8)] [&>a]:cursor-pointer [&>a]:hover:text-(--primary-foreground)">
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
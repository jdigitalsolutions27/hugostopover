export default function Loading() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="bg-cocoa/10 h-20 animate-pulse" />
      <main className="container-shell py-16">
        <div className="bg-gold/25 h-5 w-40 animate-pulse rounded" />
        <div className="bg-cocoa/10 mt-4 h-14 max-w-2xl animate-pulse rounded-xl" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="paper-card overflow-hidden">
              <div className="bg-beige aspect-[4/3] animate-pulse" />
              <div className="space-y-3 p-6">
                <div className="bg-cocoa/10 h-5 animate-pulse rounded" />
                <div className="bg-cocoa/10 h-4 w-2/3 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

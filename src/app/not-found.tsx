import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a12] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="mt-4 text-lg text-gray-400">Page not found</p>
        <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
            Go Home
          </Link>
          <Link href="/audit/new" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors">
            Start Aura Check
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2ECE1] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1C1917]">404</h1>
        <p className="mt-4 text-lg text-[#6f675e]">Page not found</p>
        <p className="mt-2 text-sm text-[#857b6e]">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-[#1C1917] hover:bg-red-500 transition-colors">
            Go Home
          </Link>
          <Link href="/audit/new" className="rounded-xl border border-[#1c1917]/10 px-6 py-3 text-sm font-medium text-[#4a443d] hover:bg-[#1c1917]/[0.04] transition-colors">
            Start Aura Check
          </Link>
        </div>
      </div>
    </div>
  );
}

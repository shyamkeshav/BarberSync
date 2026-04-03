import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="flex justify-between items-center p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">BarberSync</h1>
        <Link href="/login" className="text-sm font-medium hover:text-blue-600">Login</Link>
      </nav>

      <div className="max-w-4xl mx-auto mt-20 text-center px-4">
        <h2 className="text-5xl font-extrabold tracking-tight mb-4">
          Premium Grooming, <span className="text-blue-600">Simplified.</span>
        </h2>
        <p className="text-lg text-slate-600 mb-10">Select your path to continue</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Path */}
          <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-60">
            <div className="text-3xl mb-4">✂️</div>
            <h3 className="font-bold text-xl mb-2">I'm a Customer</h3>
            <p className="text-sm text-slate-500">Coming Soon</p>
          </div>

          {/* Owner Path - THIS IS THE ACTIVE ONE */}
          <Link href="/owner-auth" className="p-8 bg-white rounded-2xl shadow-xl border-2 border-blue-100 hover:border-blue-500 transition-all transform hover:-translate-y-1">
            <div className="text-3xl mb-4">🏪</div>
            <h3 className="font-bold text-xl mb-2 text-blue-700">I'm a Shop Owner</h3>
            <p className="text-sm text-slate-500">Register or manage your existing shop.</p>
          </Link>

          {/* Staff Path */}
          <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-60">
            <div className="text-3xl mb-4">💈</div>
            <h3 className="font-bold text-xl mb-2">I'm a Stylist</h3>
            <p className="text-sm text-slate-500">Coming Soon</p>
          </div>
        </div>
      </div>
    </main>
  );
}
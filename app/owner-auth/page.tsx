import Link from 'next/link';

export default function OwnerAuthChoice() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Shop Owner Portal</h1>
          <p className="text-slate-500">Grow your business with BarberSync</p>
        </div>

        {/* Option 1: Register */}
        <Link href="/register-shop" className="block p-6 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition text-center">
          <h3 className="font-bold text-xl">Register New Shop</h3>
          <p className="text-blue-100 text-sm">Setup your services, staff, and location</p>
        </Link>

        {/* Option 2: Login */}
        <Link href="/login" className="block p-6 bg-white border-2 border-slate-200 rounded-xl shadow-md hover:border-blue-500 transition text-center">
          <h3 className="font-bold text-xl text-slate-800">Login to Shop</h3>
          <p className="text-slate-500 text-sm">Manage bookings and check staff performance</p>
        </Link>
        
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
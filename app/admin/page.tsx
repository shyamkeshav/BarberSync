export default function AdminPortal() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <div className="border-b border-slate-700 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-red-500">Super Admin Command Center</h1>
        <p className="text-slate-400">System Health: <span className="text-green-400">Online</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase font-bold">Total Shops</h3>
          <p className="text-4xl font-mono mt-2">1,204</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase font-bold">Revenue (INR)</h3>
          <p className="text-4xl font-mono mt-2">₹45,500</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase font-bold">Active Bookings</h3>
          <p className="text-4xl font-mono mt-2">89</p>
        </div>
      </div>
      
      <button className="mt-10 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition">
        Generate Platform Report
      </button>
    </main>
  );
}
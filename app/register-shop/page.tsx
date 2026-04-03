"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Camera, ImagePlus, Trash2, Plus, Store, User, 
  Users, Scissors, MapPin, ShieldCheck, 
  FileCheck, Loader2, CheckCircle2 
} from "lucide-react"; 

export default function RegisterShop() {
  const router = useRouter();
  
  // State Management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barbers, setBarbers] = useState([{ id: Date.now(), name: "", age: "", phone: "", exp: "", joinDate: "", salary: "" }]);
  const [customServices, setCustomServices] = useState<{id: number, name: string, price: string}[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [sameAsOwner, setSameAsOwner] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [locationPinned, setLocationPinned] = useState(false);

  const commonServices = ["Haircut", "Beard Trim", "Head Massage", "Face Clean-up", "Hair Color"];

  // Logic: Combined and cleaned up addCustomService
  const addCustomService = () => {
    if (newServiceName.trim() && newServicePrice.trim()) {
      setCustomServices([
        ...customServices, 
        { id: Date.now(), name: newServiceName, price: newServicePrice }
      ]);
      setNewServiceName(""); 
      setNewServicePrice("");
    }
  };

  const removeCustomService = (id: number) => {
    setCustomServices(customServices.filter(service => service.id !== id));
  };

  const addBarber = () => setBarbers([...barbers, { id: Date.now(), name: "", age: "", phone: "", exp: "", joinDate: "", salary: "" }]);
  
  const removeBarber = (id: number) => {
    if (barbers.length > 1) setBarbers(barbers.filter(barber => barber.id !== id));
  };

  // Form Submission Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/login"); 
    }, 2000);
  };

  // Validation Logic
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== "";
  const isFormValid = passwordsMatch && hasLength && hasNumber && hasSymbol && !isSubmitting;

  const handleGetLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocationPinned(true);
      }, () => {
        alert("Please enable location permissions to pin your shop.");
      });
    }
  };

  // Sub-component for Phone
  const PhoneInput = ({ placeholder, required = false }: { placeholder: string, required?: boolean }) => (
    <div className="flex w-full min-w-0">
      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold">+91</span>
      <input 
        required={required} 
        type="tel" 
        pattern="[6-9][0-9]{9}" 
        placeholder={placeholder} 
        className="flex-1 min-w-0 p-3 border rounded-r-xl outline-none focus:border-blue-500 transition w-full text-slate-900 bg-white" 
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100">
        <Link href="/login" className="text-blue-600 text-sm font-bold hover:underline">← Back to Login</Link>
        <h1 className="text-3xl font-bold mt-4 tracking-tight text-slate-900">Register Your Shop</h1>
        <p className="text-slate-500 mb-8 font-medium">Create your business account to get started.</p>

        <form className="space-y-12" onSubmit={handleSubmit}>
          
          {/* SECTION 1: OWNER */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <User size={20} /> <h2>Owner & Identity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="Owner Full Name *" className="p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />
              <PhoneInput placeholder="Owner Mobile *" required={true} />
              <input required type="email" placeholder="Email Address *" className="p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />
              <input type="text" placeholder="Aadhaar Number (Optional)" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />

              <div className="md:col-span-2">
                <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-blue-50 transition">
                  <FileCheck className="text-blue-600" size={20} />
                  <span className="text-sm font-bold text-slate-600 uppercase">Upload Aadhaar (Optional)</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" />
                </label>
              </div>

              <div className="space-y-2">
                <input required type="password" placeholder="Set Password *" className="w-full p-3 border rounded-xl outline-none text-slate-900 bg-white" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="flex gap-2 text-[10px] font-bold uppercase text-slate-400 px-1">
                    <span className={hasLength ? "text-green-600" : ""}>8+ Chars</span>
                    <span className={hasNumber ? "text-green-600" : ""}>Number</span>
                    <span className={hasSymbol ? "text-green-600" : ""}>Symbol</span>
                </div>
              </div>
              <input required type="password" placeholder="Confirm Password *" className={`p-3 border rounded-xl outline-none text-slate-900 bg-white ${passwordsMatch ? 'border-green-500' : ''}`} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </section>

          {/* SECTION 2: SHOP DETAILS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Store size={20} /> <h2>Shop Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Shop Name *" className="p-3 border rounded-xl md:col-span-2 outline-none focus:border-blue-500 text-slate-900 bg-white" />
              <select required className="p-3 border rounded-xl bg-white outline-none focus:border-blue-500 text-slate-900" defaultValue="">
                <option value="" disabled>Category *</option>
                <option value="unisex">Unisex</option>
                <option value="men">Men Only</option>
                <option value="women">Women Only</option>
              </select>
              <input required type="number" placeholder="Total Chairs *" className="p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />
              <div className="flex items-center gap-2 px-2 md:col-span-2">
                <input type="checkbox" id="samePhone" checked={sameAsOwner} onChange={() => setSameAsOwner(!sameAsOwner)} />
                <label htmlFor="samePhone" className="text-sm font-medium cursor-pointer text-slate-600">Business phone same as owner</label>
              </div>
              {!sameAsOwner && <div className="md:col-span-2"><PhoneInput placeholder="Shop Contact Number *" required={true} /></div>}
              <textarea required placeholder="Full Shop Address *" className="p-3 border rounded-xl md:col-span-2 outline-none focus:border-blue-500 text-slate-900 bg-white" rows={2}></textarea>
              <button type="button" onClick={handleGetLocation} className={`md:col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl font-bold border transition ${locationPinned ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}>
                <MapPin size={18} /> {locationPinned ? "GPS Coordinates Locked" : "Pin Shop Location (Optional)"}
              </button>
            </div>
          </section>

          {/* SECTION 4: SERVICES */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Scissors size={20} /> <h2>Services & Pricing</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {commonServices.map(service => (
                <div key={service} className="flex items-center gap-4 p-3 border rounded-xl bg-white">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{service}</span>
                  </div>
                  <div className="flex items-center gap-1 border-l pl-4">
                    <span className="text-slate-400 text-xs font-bold">₹</span>
                    <input type="number" placeholder="Price" className="w-24 p-1 outline-none text-sm text-slate-900 bg-white" />
                  </div>
                </div>
              ))}

              {customServices.map((cs) => (
                <div key={cs.id} className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/50 border-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">{cs.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-blue-600">₹{cs.price}</span>
                    <button type="button" onClick={() => removeCustomService(cs.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 mt-4 p-3 border-2 border-dashed border-slate-200 rounded-xl">
                <input 
                  type="text" 
                  placeholder="Service Name" 
                  className="flex-1 p-2 text-sm outline-none bg-transparent"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
                <div className="flex items-center gap-1 border-x px-3">
                  <span className="text-slate-400 text-xs font-bold">₹</span>
                  <input 
                    type="number" 
                    placeholder="Price" 
                    className="w-20 p-2 text-sm outline-none bg-transparent"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                  />
                </div>
                <button type="button" onClick={addCustomService} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION : STAFF */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Users size={20} /> <h2>Staff (Optional)</h2>
            </div>
            {barbers.map((barber) => (
              <div key={barber.id} className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-200 relative grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Barber Name" className="p-2 border rounded-lg bg-white text-slate-900" />
                <input type="number" placeholder="Age" className="p-2 border rounded-lg bg-white text-slate-900" />
                <PhoneInput placeholder="Mobile" required={false} />
                <input type="number" placeholder="Exp (Years)" className="p-2 border rounded-lg bg-white text-slate-900" />
                <input type="date" className="p-2 border rounded-lg bg-white text-slate-500" />
                <input type="number" placeholder="Salary" className="p-2 border rounded-lg bg-white text-slate-900" />
                {barbers.length > 1 && (
                  <button type="button" onClick={() => removeBarber(barber.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full"><Trash2 size={14}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addBarber} className="text-blue-600 font-bold text-sm bg-blue-50 px-6 py-3 rounded-xl">+ Add Barber Later</button>
          </section>

          {/* LEGAL & SUBMIT */}
          <section className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
             <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
             <label className="text-xs text-slate-600 leading-relaxed cursor-pointer">
               <input required type="checkbox" className="mr-2 w-4 h-4 align-middle" />
               I confirm I am the legal owner and agree to the <b>Terms of Service</b>. *
             </label>
          </section>

          <button 
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
              !isFormValid 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-700 text-white hover:bg-blue-800 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={24} /> Creating Account...</>
            ) : (
              "Create Account & Launch Shop"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
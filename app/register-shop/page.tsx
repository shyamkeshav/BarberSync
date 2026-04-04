"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { 
  Camera, ImagePlus, Trash2, Plus, Store, User, 
  Users, Scissors, MapPin, ShieldCheck, 
  FileCheck, Loader2, CheckCircle2, Clock, CalendarDays 
} from "lucide-react"; 

export default function RegisterShop() {
  const router = useRouter();
  
  // State Management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barbers, setBarbers] = useState([{ id: Date.now(), name: "", age: "", phone: "", exp: "", joinDate: "", salary: "" }]);
  
  const [customServices, setCustomServices] = useState<{id: number, name: string, price: string, duration: string}[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30");

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [openDays, setOpenDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [sameAsOwner, setSameAsOwner] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [locationPinned, setLocationPinned] = useState(false);

  const commonServices = ["Haircut", "Beard Trim", "Head Massage", "Face Clean-up", "Hair Color"];

  // Logic for Barbers and Services
  const addCustomService = () => {
    if (newServiceName.trim() && newServicePrice.trim()) {
      setCustomServices([...customServices, { 
        id: Date.now(), 
        name: newServiceName, 
        price: newServicePrice, 
        duration: newServiceDuration 
      }]);
      setNewServiceName(""); 
      setNewServicePrice("");
      setNewServiceDuration("30");
    }
  };

  const removeCustomService = (id: number) => {
    setCustomServices(customServices.filter(service => service.id !== id));
  };

  const toggleDay = (day: string) => {
    setOpenDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addBarber = () => setBarbers([...barbers, { id: Date.now(), name: "", age: "", phone: "", exp: "", joinDate: "", salary: "" }]);
  
  const removeBarber = (id: number) => {
    if (barbers.length > 1) setBarbers(barbers.filter(barber => barber.id !== id));
  };

  const updateBarberField = (id: number, field: string, value: string) => {
    setBarbers(barbers.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const ownerMobile = formData.get("ownerMobile") as string;

    try {
      // 1. Create Auth Account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'owner' } }
      });

      if (authError) throw authError;
      const ownerId = authData.user?.id;

      if (ownerId) {
        // 2. Upload Photo Logic (FIXED)
        let photoUrl = null;
        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${ownerId}-${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('shop-photos')
            .upload(fileName, imageFile);
          
          if (uploadError) {
             console.error("Storage Error:", uploadError.message);
             // We continue even if upload fails, but you could 'throw uploadError' to stop here
          } else {
            // Correct way to get Public URL in latest Supabase SDK
            const { data } = supabase.storage
              .from('shop-photos')
              .getPublicUrl(fileName);
            
            if (data) photoUrl = data.publicUrl;
          }
        }

        // 3. Save Shop
        const { error: shopError } = await supabase.from('shops').insert([{
          id: ownerId,
          owner_full_name: formData.get("ownerName"),
          owner_mobile: ownerMobile,
          owner_email: email,
          aadhaar_number: formData.get("aadhaar"),
          shop_name: formData.get("shopName"),
          category: formData.get("category"),
          total_chairs: parseInt(formData.get("chairs") as string),
          shop_contact_number: sameAsOwner ? ownerMobile : formData.get("shopPhone"),
          full_address: formData.get("address"),
          location_pinned: locationPinned,
          shop_photo_url: photoUrl,
          opening_time: formData.get("openTime"),
          closing_time: formData.get("closeTime"),
          open_days: openDays,
          password_hash: password 
        }]);

        if (shopError) throw shopError;

        // 4. Save Services
        const selectedCommon = commonServices
          .filter((_, i) => (e.target as any)[`common-${i}`]?.checked)
          .map((name, i) => ({
            shop_id: ownerId,
            service_name: name,
            price: parseFloat((e.target as any)[`price-${i}`].value || "0"),
            duration_minutes: parseInt((e.target as any)[`duration-${i}`].value || "30"),
            is_custom: false
          }));

        const customToSave = customServices.map(cs => ({
          shop_id: ownerId,
          service_name: cs.name,
          price: parseFloat(cs.price),
          duration_minutes: parseInt(cs.duration),
          is_custom: true
        }));

        const allServices = [...selectedCommon, ...customToSave];
        if (allServices.length > 0) {
          const { error: serError } = await supabase.from('services').insert(allServices);
          if (serError) throw serError;
        }

        // 5. Save Barbers
        const barbersToSave = barbers.map(b => ({
          shop_id: ownerId,
          name: b.name,
          age: parseInt(b.age) || null,
          phone: b.phone,
          experience_years: parseInt(b.exp) || null,
          joining_date: b.joinDate || null,
          salary: parseFloat(b.salary) || null
        }));

        const { error: barbError } = await supabase.from('barbers').insert(barbersToSave);
        if (barbError) throw barbError;

        router.push("/login"); 
      }
    } catch (error: any) {
      alert("Registration Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation Logic
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password === confirmPassword && password !== "";
  const isFormValid = passwordsMatch && hasLength && hasNumber && hasSymbol && !isSubmitting;

  const handleGetLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => setLocationPinned(true), 
      () => alert("Please enable location permissions."));
    }
  };

  const PhoneInput = ({ name, placeholder, required = false }: any) => (
    <div className="flex w-full min-w-0">
      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold">+91</span>
      <input name={name} required={required} type="tel" pattern="[6-9][0-9]{9}" placeholder={placeholder} className="flex-1 min-w-0 p-3 border rounded-r-xl outline-none focus:border-blue-500 transition w-full text-slate-900 bg-white" />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 text-slate-900">
        <Link href="/login" className="text-blue-600 text-sm font-bold hover:underline">← Back to Login</Link>
        <h1 className="text-3xl font-bold mt-4 tracking-tight text-slate-900">Register Your Shop</h1>
        <form className="space-y-12" onSubmit={handleSubmit}>
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <User size={20} /> <h2>Owner & Identity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="ownerName" required type="text" placeholder="Owner Full Name *" className="p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />
              <PhoneInput name="ownerMobile" placeholder="Owner Mobile *" required={true} />
              <input name="email" required type="email" placeholder="Email Address *" className="p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />
              <input name="aadhaar" type="text" placeholder="Aadhaar Number (Optional)" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500 text-slate-900 bg-white" />
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

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Camera size={20} /> <h2>Shop Appearance</h2>
            </div>
            <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden transition hover:bg-slate-100">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {setImagePreview(null); setImageFile(null);}} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                    <Trash2 size={16}/>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer p-4 w-full h-full justify-center">
                  <ImagePlus size={40} className="text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Shop Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Store size={20} /> <h2>Shop Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="shopName" required placeholder="Shop Name *" className="p-3 border rounded-xl md:col-span-2 outline-none focus:border-blue-500 text-slate-900 bg-white" />
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                  <CalendarDays size={14} /> Weekly Open Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition border ${
                        openDays.includes(day) 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Opening Time</label>
                <input name="openTime" type="time" defaultValue="09:00" className="w-full p-3 border rounded-xl bg-white text-slate-900 outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Closing Time</label>
                <input name="closeTime" type="time" defaultValue="21:00" className="w-full p-3 border rounded-xl bg-white text-slate-900 outline-none focus:border-blue-500" />
              </div>

              <select name="category" required className="p-3 border rounded-xl bg-white text-slate-900" defaultValue="">
                <option value="" disabled>Category *</option>
                <option value="unisex">Unisex</option>
                <option value="men">Men Only</option>
                <option value="women">Women Only</option>
              </select>
              <input name="chairs" required type="number" placeholder="Total Chairs *" className="p-3 border rounded-xl text-slate-900 bg-white" />
              <div className="flex items-center gap-2 px-2 md:col-span-2">
                <input type="checkbox" id="samePhone" checked={sameAsOwner} onChange={() => setSameAsOwner(!sameAsOwner)} />
                <label htmlFor="samePhone" className="text-sm font-medium text-slate-600">Business phone same as owner</label>
              </div>
              {!sameAsOwner && <div className="md:col-span-2"><PhoneInput name="shopPhone" placeholder="Shop Contact Number *" required={true} /></div>}
              <textarea name="address" required placeholder="Full Shop Address *" className="p-3 border rounded-xl md:col-span-2 text-slate-900 bg-white" rows={2}></textarea>
              <button type="button" onClick={handleGetLocation} className={`md:col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl font-bold border ${locationPinned ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                <MapPin size={18} /> {locationPinned ? "GPS Coordinates Locked" : "Pin Shop Location (Optional)"}
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Scissors size={20} /> <h2>Services & Duration</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {commonServices.map((service, i) => (
                <div key={service} className="flex flex-wrap items-center gap-3 p-3 border rounded-xl bg-white">
                  <div className="flex items-center gap-2 min-w-[140px] flex-1">
                    <input name={`common-${i}`} type="checkbox" className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-50 px-2 rounded-lg border">
                      <span className="text-slate-400 text-xs font-bold">₹</span>
                      <input name={`price-${i}`} type="number" placeholder="Price" className="w-16 p-2 text-sm bg-transparent outline-none" />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 px-2 rounded-lg border">
                      <Clock size={14} className="text-slate-400" />
                      <input name={`duration-${i}`} type="number" defaultValue="30" className="w-12 p-2 text-sm bg-transparent outline-none" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Min</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {customServices.map((cs) => (
                <div key={cs.id} className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/50 border-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">{cs.name}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{cs.duration} Min</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-blue-600">₹{cs.price}</span>
                    <button type="button" onClick={() => removeCustomService(cs.id)} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4 p-3 border-2 border-dashed border-slate-200 rounded-xl">
                <input type="text" placeholder="Service Name" className="p-2 text-sm outline-none border rounded-lg" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                <input type="number" placeholder="Price ₹" className="p-2 text-sm outline-none border rounded-lg" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} />
                <input type="number" placeholder="Min" className="p-2 text-sm outline-none border rounded-lg" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} />
                <button type="button" onClick={addCustomService} className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center"><Plus size={20} /></button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-blue-700 font-bold border-b pb-2">
              <Users size={20} /> <h2>Staff (Optional)</h2>
            </div>
            {barbers.map((barber) => (
              <div key={barber.id} className="p-4 bg-slate-50 rounded-2xl border relative grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Stylist Name" className="p-2 border rounded-lg bg-white text-slate-900" value={barber.name} onChange={(e) => updateBarberField(barber.id, 'name', e.target.value)} />
                <input type="number" placeholder="Age" className="p-2 border rounded-lg bg-white text-slate-900" value={barber.age} onChange={(e) => updateBarberField(barber.id, 'age', e.target.value)} />
                <input type="tel" placeholder="Mobile" className="p-2 border rounded-lg bg-white text-slate-900" value={barber.phone} onChange={(e) => updateBarberField(barber.id, 'phone', e.target.value)} />
                <input type="number" placeholder="Exp (Years)" className="p-2 border rounded-lg bg-white text-slate-900" value={barber.exp} onChange={(e) => updateBarberField(barber.id, 'exp', e.target.value)} />
                <input type="date" className="p-2 border rounded-lg bg-white text-slate-500" value={barber.joinDate} onChange={(e) => updateBarberField(barber.id, 'joinDate', e.target.value)} />
                <input type="number" placeholder="Salary" className="p-2 border rounded-lg bg-white text-slate-900" value={barber.salary} onChange={(e) => updateBarberField(barber.id, 'salary', e.target.value)} />
                {barbers.length > 1 && (
                  <button type="button" onClick={() => removeBarber(barber.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md transition hover:scale-110"><Trash2 size={14}/></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addBarber} className="text-blue-600 font-bold text-sm bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-100 transition tracking-wide uppercase">+ Add Stylist</button>
          </section>

          <section className="p-5 bg-blue-50 rounded-2xl border flex gap-4">
             <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
             <label className="text-xs text-slate-600 leading-relaxed cursor-pointer">
               <input required type="checkbox" className="mr-2 w-4 h-4 align-middle" />
               I confirm I am the legal owner and agree to the <b>Terms of Service</b>. *
             </label>
          </section>

          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${!isFormValid ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-blue-200 active:scale-[0.98]'}`}
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={24} /> Launching Shop...</> : "Create Account & Launch Shop"}
          </button>
        </form>
      </div>
    </main>
  );
}
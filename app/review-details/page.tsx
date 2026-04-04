"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Store, Users, Loader2, Edit3, 
  Save, CheckCircle, Trash2, 
  Camera, ShieldCheck, Calendar, Scissors, Lock, Plus, type LucideIcon 
} from "lucide-react";

// --- TYPES & INTERFACES ---
interface ShopData {
  id: string;
  shop_name: string;
  category: string;
  total_chairs: number;
  shop_contact_number: string;
  full_address: string;
  opening_time: string;
  closing_time: string;
  open_days: string[];
  shop_photo_url?: string;
  owner_full_name?: string;
  owner_email?: string;
  owner_mobile?: string;
  aadhaar_number?: string;
}

interface Service {
  id: string | number;
  shop_id: string;
  service_name: string;
  price: number;
  duration_minutes: number;
}

interface Barber {
  id: string | number;
  shop_id: string;
  name: string;
  phone: string;
  age: number | null;
  experience_years: number | null;
  joining_date: string;
  salary: number | null;
}

interface InfoBoxProps {
  label: string;
  value: any;
  isEditing: boolean;
  onChange?: (v: string) => void;
  type?: string;
  options?: string[];
  readOnly?: boolean;
}

interface MiniFieldProps {
  label: string;
  value: any;
  onChange: (v: string) => void;
  disabled: boolean;
  type?: string;
}

export default function FirstLoginReview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  const [editMode, setEditMode] = useState(false);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      setUserId(user.id);

      const [shopRes, servRes, barbRes] = await Promise.all([
        supabase.from("shops").select("*").eq("id", user.id).single(),
        supabase.from("services").select("*").eq("shop_id", user.id).order('id'),
        supabase.from("barbers").select("*").eq("shop_id", user.id).order('id')
      ]);

      if (shopRes.data) setShopData(shopRes.data);
      setServices(servRes.data || []);
      setBarbers(barbRes.data || []);

      console.log("Verified Staff Loaded:", barbRes.data?.length);

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    if (!shopData) return;
    const currentDays = shopData.open_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setShopData({ ...shopData, open_days: newDays });
  };

  const handleBarberChange = (id: string | number, updates: Partial<Barber>) => {
    setBarbers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleServiceChange = (id: string | number, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addNewBarber = () => {
    if (!userId) return;
    const newBarber: Barber = {
      id: `temp-${Date.now()}`,
      shop_id: userId,
      name: "",
      phone: "",
      age: null,
      experience_years: null,
      joining_date: new Date().toISOString().split('T')[0],
      salary: null
    };
    setBarbers(prev => [...prev, newBarber]);
  };

  const addNewService = () => {
    if (!userId) return;
    const newService: Service = {
      id: `temp-${Date.now()}`,
      shop_id: userId,
      service_name: "",
      price: 0,
      duration_minutes: 30
    };
    setServices(prev => [...prev, newService]);
  };

  const saveAllChanges = async () => {
    if (!userId || !shopData) return;
    setSaving(true);
    try {
      // 1. Update Shop
      const { error: shopErr } = await supabase.from("shops").update({
        shop_name: shopData.shop_name,
        category: shopData.category,
        total_chairs: shopData.total_chairs,
        shop_contact_number: shopData.shop_contact_number,
        full_address: shopData.full_address,
        opening_time: shopData.opening_time,
        closing_time: shopData.closing_time,
        open_days: shopData.open_days
      }).eq("id", userId);
      if (shopErr) throw shopErr;
      
      // 2. Barbers
      const bInsert = barbers.filter(b => String(b.id).startsWith('temp-')).map(({ id, ...r }) => r);
      const bUpsert = barbers.filter(b => !String(b.id).startsWith('temp-'));
      if (bInsert.length) await supabase.from("barbers").insert(bInsert);
      if (bUpsert.length) await supabase.from("barbers").upsert(bUpsert);
      
      // 3. Services
      const sInsert = services.filter(s => String(s.id).startsWith('temp-')).map(({ id, ...r }) => r);
      const sUpsert = services.filter(s => !String(s.id).startsWith('temp-'));
      if (sInsert.length) await supabase.from("services").insert(sInsert);
      if (sUpsert.length) await supabase.from("services").upsert(sUpsert);

      await fetchInitialData();
      setEditMode(false);
      alert("All changes saved successfully!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !shopData) return;
    setUploading(true);
    try {
      const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(`shop-photos/${fileName}`, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(`shop-photos/${fileName}`);
      
      setShopData({ ...shopData, shop_photo_url: publicUrl });
      if (!editMode) await supabase.from("shops").update({ shop_photo_url: publicUrl }).eq("id", userId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteBarber = async (id: any) => {
    if (!confirm("Remove this staff member?")) return;
    if (!String(id).startsWith('temp-')) {
      await supabase.from("barbers").delete().eq("id", id);
    }
    setBarbers(prev => prev.filter(b => b.id !== id));
  };

  const deleteService = async (id: any) => {
    if (!confirm("Remove this service?")) return;
    if (!String(id).startsWith('temp-')) {
      await supabase.from("services").delete().eq("id", id);
    }
    setServices(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <main className="min-h-screen bg-[#FBFBFE] pb-40">
      <div className="bg-white border-b px-6 py-12 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <ShieldCheck size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Account Registered</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Review Your Business</h1>
          </div>
          <button 
            onClick={() => editMode ? saveAllChanges() : setEditMode(true)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition shadow-lg ${editMode ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'}`}
          >
            {saving ? <Loader2 className="animate-spin" /> : editMode ? <><Save size={20}/> Save Changes</> : <><Edit3 size={20}/> Edit Details</>}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
        {/* BUSINESS PROFILE */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <SectionTitle icon={Store} title="Business Profile" color="text-blue-600" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="aspect-square bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-200 relative group">
                {shopData?.shop_photo_url ? (
                  <img src={shopData.shop_photo_url} className="w-full h-full object-cover" alt="Shop" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Camera size={48} /></div>
                )}
                {editMode && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold gap-2">
                    {uploading ? <Loader2 className="animate-spin" /> : <><Camera size={20}/> Replace</>}
                  </button>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                <InfoBox label="Owner Name" value={shopData?.owner_full_name} isEditing={false} readOnly />
                <InfoBox label="Owner Email" value={shopData?.owner_email} isEditing={false} readOnly />
                <InfoBox label="Owner Mobile" value={shopData?.owner_mobile} isEditing={false} readOnly />
                <InfoBox label="Aadhaar" value={shopData?.aadhaar_number ? `XXXX-XXXX-${shopData.aadhaar_number.slice(-4)}` : "Pending"} isEditing={false} readOnly />
                <div className="absolute top-4 right-4"><Lock size={14} className="text-slate-400" /></div>
              </div>

              <InfoBox label="Shop Name" value={shopData?.shop_name} isEditing={editMode} onChange={(v) => setShopData(prev => prev ? {...prev, shop_name: v} : null)} />
              <InfoBox label="Contact" value={shopData?.shop_contact_number} isEditing={editMode} onChange={(v) => setShopData(prev => prev ? {...prev, shop_contact_number: v} : null)} />
              <InfoBox label="Category" value={shopData?.category} isEditing={editMode} type="select" options={['men', 'women', 'unisex']} onChange={(v) => setShopData(prev => prev ? {...prev, category: v} : null)} />
              <InfoBox label="Chairs" value={shopData?.total_chairs} isEditing={editMode} type="number" onChange={(v) => setShopData(prev => prev ? {...prev, total_chairs: Number(v)} : null)} />
              <InfoBox label="Opening" value={shopData?.opening_time} isEditing={editMode} type="time" onChange={(v) => setShopData(prev => prev ? {...prev, opening_time: v} : null)} />
              <InfoBox label="Closing" value={shopData?.closing_time} isEditing={editMode} type="time" onChange={(v) => setShopData(prev => prev ? {...prev, closing_time: v} : null)} />
              <div className="sm:col-span-2">
                <InfoBox label="Full Address" value={shopData?.full_address} isEditing={editMode} onChange={(v) => setShopData(prev => prev ? {...prev, full_address: v} : null)} />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Calendar size={12}/> Operating Days</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} disabled={!editMode} onClick={() => toggleDay(day)} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${shopData?.open_days?.includes(day) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{day}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Scissors} title="Menu & Services" color="text-purple-600" />
            {editMode && <button onClick={addNewService} className="flex items-center gap-2 text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl"><Plus size={16} /> Add Service</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 relative shadow-sm">
                <input disabled={!editMode} className="font-black text-lg outline-none w-full mb-4 border-b pb-2 bg-transparent" value={s.service_name} placeholder="Service Name" onChange={(e) => handleServiceChange(s.id, { service_name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <MiniField label="Price (₹)" value={s.price} type="number" disabled={!editMode} onChange={(v) => handleServiceChange(s.id, { price: Number(v) })} />
                  <MiniField label="Duration" value={s.duration_minutes} type="number" disabled={!editMode} onChange={(v) => handleServiceChange(s.id, { duration_minutes: Number(v) })} />
                </div>
                {editMode && <button onClick={() => deleteService(s.id)} className="absolute top-5 right-5 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>}
              </div>
            ))}
          </div>
        </section>

        {/* STAFF SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Users} title="Staff & Payroll" color="text-orange-600" />
            {editMode && <button onClick={addNewBarber} className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl"><Plus size={16} /> Add Barber</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {barbers.length > 0 ? (
              barbers.map(b => (
                <div key={b.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative transition">
                  <div className="flex gap-4 mb-6 pr-8">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center font-black text-orange-600 text-xl">
                      {b.name ? b.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1">
                      <input disabled={!editMode} className="font-black text-lg outline-none w-full bg-transparent" value={b.name} placeholder="Barber Name" onChange={(e) => handleBarberChange(b.id, { name: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t pt-5">
                    <MiniField label="Phone" value={b.phone} disabled={!editMode} onChange={(v) => handleBarberChange(b.id, { phone: v })} />
                    <MiniField label="Age" value={b.age} type="number" disabled={!editMode} onChange={(v) => handleBarberChange(b.id, { age: Number(v) })} />
                    <MiniField label="Exp (Y)" value={b.experience_years} type="number" disabled={!editMode} onChange={(v) => handleBarberChange(b.id, { experience_years: Number(v) })} />
                    <MiniField label="Salary" value={b.salary} type="number" disabled={!editMode} onChange={(v) => handleBarberChange(b.id, { salary: Number(v) })} />
                    <div className="sm:col-span-2">
                      <MiniField label="Joining" value={b.joining_date} type="date" disabled={!editMode} onChange={(v) => handleBarberChange(b.id, { joining_date: v })} />
                    </div>
                  </div>
                  {editMode && <button onClick={() => deleteBarber(b.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><Trash2 size={20}/></button>}
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <Users className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-slate-500 font-bold">No staff members listed.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t p-6 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button disabled={editMode} onClick={() => router.push("/onboarding/preview")} className={`px-12 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all ${editMode ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-xl hover:scale-105'}`}>Review Finished <CheckCircle size={22} /></button>
        </div>
      </div>
    </main>
  );
}

// Helpers
function SectionTitle({ icon: Icon, title, color }: { icon: LucideIcon, title: string, color: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`${color} bg-current/10 p-2 rounded-lg`}><Icon size={20} /></div>
      <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">{title}</h2>
    </div>
  );
}

function InfoBox({ label, value, isEditing, onChange, type = "text", options = [], readOnly = false }: InfoBoxProps) {
  return (
    <div className="space-y-1 w-full">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      {isEditing && !readOnly ? (
        type === 'select' ? (
          <select value={value || ""} onChange={(e) => onChange?.(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none">
            {options.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
          </select>
        ) : (
          <input type={type} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
        )
      ) : (
        <p className={`font-bold p-1 truncate ${readOnly ? 'text-slate-500 text-sm' : 'text-slate-700'}`}>{value || '---'}</p>
      )}
    </div>
  );
}

function MiniField({ label, value, onChange, disabled, type = "text" }: MiniFieldProps) {
  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-transparent focus-within:border-slate-200">
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{label}</p>
      <input type={type} disabled={disabled} className="w-full bg-transparent font-black text-slate-800 outline-none text-sm" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
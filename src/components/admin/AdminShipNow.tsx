import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plane, Ship, Truck, Calculator, ArrowRight,
  CheckCircle, MapPin, User, Phone, Mail, Scale, Ruler,
  Shield, Clock, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const shippingMethods = [
  { id: "express", name: "Express Air", icon: Plane, days: "1-3 days", multiplier: 2.5, description: "Fastest delivery via air freight" },
  { id: "standard", name: "Standard Air", icon: Plane, days: "3-5 days", multiplier: 1.5, description: "Reliable air freight service" },
  { id: "ocean", name: "Ocean Freight", icon: Ship, days: "15-30 days", multiplier: 0.5, description: "Cost-effective for large shipments" },
  { id: "ground", name: "Ground Transport", icon: Truck, days: "5-10 days", multiplier: 0.8, description: "Domestic and regional delivery" },
];

const countries = [
  "USA", "Canada", "UK", "Germany", "France", "China", "Japan",
  "Australia", "Brazil", "India", "Mexico", "South Korea", "Singapore",
  "Netherlands", "Italy", "Spain", "Sweden", "Switzerland"
];

interface FormData {
  originName: string; originAddress: string; originCity: string; originCountry: string; originPhone: string; originEmail: string;
  destName: string; destAddress: string; destCity: string; destCountry: string; destPhone: string; destEmail: string;
  weight: string; length: string; width: string; height: string; description: string; declaredValue: string;
  shippingMethod: string; insurance: boolean;
}

const initialFormData: FormData = {
  originName: "", originAddress: "", originCity: "", originCountry: "USA", originPhone: "", originEmail: "",
  destName: "", destAddress: "", destCity: "", destCountry: "", destPhone: "", destEmail: "",
  weight: "", length: "", width: "", height: "", description: "", declaredValue: "",
  shippingMethod: "standard", insurance: false,
};

export function AdminShipNow() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [quote, setQuote] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (quote) setQuote(null);
  };

  const calculateQuote = () => {
    const weight = parseFloat(formData.weight) || 0;
    const method = shippingMethods.find(m => m.id === formData.shippingMethod);
    const multiplier = method?.multiplier || 1;
    let basePrice = weight * 5 * multiplier;
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    if (length && width && height) {
      const dimWeight = (length * width * height) / 5000;
      basePrice = Math.max(weight, dimWeight) * 5 * multiplier;
    }
    if (formData.insurance && formData.declaredValue) {
      basePrice += parseFloat(formData.declaredValue) * 0.02;
    }
    basePrice = Math.max(basePrice, 25);
    setQuote(Math.round(basePrice * 100) / 100);
  };

  const generateOrderNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CL-${dateStr}-${random}`;
  };

  const handleSubmitOrder = async () => {
    if (!quote) { toast.error("Calculate a quote first"); return; }
    setIsSubmitting(true);
    try {
      const newOrderNumber = generateOrderNumber();
      const { error: orderError } = await supabase.from("shipping_orders").insert({
        order_number: newOrderNumber,
        origin_name: formData.originName, origin_address: formData.originAddress,
        origin_city: formData.originCity, origin_country: formData.originCountry,
        origin_phone: formData.originPhone, origin_email: formData.originEmail,
        destination_name: formData.destName, destination_address: formData.destAddress,
        destination_city: formData.destCity, destination_country: formData.destCountry,
        destination_phone: formData.destPhone, destination_email: formData.destEmail || null,
        weight_kg: parseFloat(formData.weight),
        length_cm: formData.length ? parseFloat(formData.length) : null,
        width_cm: formData.width ? parseFloat(formData.width) : null,
        height_cm: formData.height ? parseFloat(formData.height) : null,
        package_description: formData.description || null,
        declared_value: formData.declaredValue ? parseFloat(formData.declaredValue) : null,
        shipping_method: formData.shippingMethod, insurance_included: formData.insurance,
        quoted_price: quote,
        session_id: crypto.randomUUID(),
        user_id: user?.id || null,
      });
      if (orderError) throw orderError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: shipmentError } = await (supabase.rpc as any)("create_shipment_from_order", {
        p_order_number: newOrderNumber,
        p_origin_city: formData.originCity, p_origin_country: formData.originCountry,
        p_destination_city: formData.destCity, p_destination_country: formData.destCountry,
        p_sender_name: formData.originName, p_recipient_name: formData.destName,
        p_weight_kg: parseFloat(formData.weight), p_shipping_method: formData.shippingMethod,
      });
      if (shipmentError) console.error("Shipment creation error:", shipmentError);

      setOrderNumber(newOrderNumber);
      setStep(4);
      toast.success("Order created successfully!");
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1: return !!(formData.originName && formData.originAddress && formData.originCity && formData.originCountry && formData.originPhone && formData.originEmail && formData.destName && formData.destAddress && formData.destCity && formData.destCountry && formData.destPhone);
      case 2: return !!(formData.weight && parseFloat(formData.weight) > 0);
      case 3: return !!quote;
      default: return false;
    }
  };

  const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethod);

  const inputClass = "w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary";
  const iconInputClass = "w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary";

  if (step === 4 && orderNumber) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">Order Created!</h2>
        <p className="text-muted-foreground mb-6">The tracking number is:</p>
        <p className="text-2xl font-mono font-bold text-primary mb-8">{orderNumber}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/tracking`} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            View Tracking
          </Link>
          <button onClick={() => { setStep(1); setFormData(initialFormData); setQuote(null); setOrderNumber(null); }} className="px-6 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-colors">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 sm:gap-4">
          {[{ num: 1, label: "Addresses" }, { num: 2, label: "Package" }, { num: 3, label: "Review" }, { num: 4, label: "Confirm" }].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s.num ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className="hidden sm:block ml-2 text-sm font-medium">{s.label}</span>
              {i < 3 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            {/* Origin */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
                <h2 className="text-xl font-bold">Pickup Address</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" value={formData.originName} onChange={(e) => updateForm("originName", e.target.value)} className={iconInputClass} placeholder="Sender name" /></div>
                </div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium mb-2">Address *</label><input type="text" value={formData.originAddress} onChange={(e) => updateForm("originAddress", e.target.value)} className={inputClass} placeholder="Street address" /></div>
                <div><label className="block text-sm font-medium mb-2">City *</label><input type="text" value={formData.originCity} onChange={(e) => updateForm("originCity", e.target.value)} className={inputClass} placeholder="City" /></div>
                <div><label className="block text-sm font-medium mb-2">Country *</label><select value={formData.originCountry} onChange={(e) => updateForm("originCountry", e.target.value)} className={inputClass}>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-2">Phone *</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="tel" value={formData.originPhone} onChange={(e) => updateForm("originPhone", e.target.value)} className={iconInputClass} placeholder="+1 234 567 890" /></div></div>
                <div><label className="block text-sm font-medium mb-2">Email *</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="email" value={formData.originEmail} onChange={(e) => updateForm("originEmail", e.target.value)} className={iconInputClass} placeholder="sender@email.com" /></div></div>
              </div>
            </div>
            {/* Destination */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-green-500" /></div>
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="block text-sm font-medium mb-2">Full Name *</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" value={formData.destName} onChange={(e) => updateForm("destName", e.target.value)} className={iconInputClass} placeholder="Recipient name" /></div></div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium mb-2">Address *</label><input type="text" value={formData.destAddress} onChange={(e) => updateForm("destAddress", e.target.value)} className={inputClass} placeholder="Street address" /></div>
                <div><label className="block text-sm font-medium mb-2">City *</label><input type="text" value={formData.destCity} onChange={(e) => updateForm("destCity", e.target.value)} className={inputClass} placeholder="City" /></div>
                <div><label className="block text-sm font-medium mb-2">Country *</label><select value={formData.destCountry} onChange={(e) => updateForm("destCountry", e.target.value)} className={inputClass}><option value="">Select country</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-2">Phone *</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="tel" value={formData.destPhone} onChange={(e) => updateForm("destPhone", e.target.value)} className={iconInputClass} placeholder="+1 234 567 890" /></div></div>
                <div><label className="block text-sm font-medium mb-2">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="email" value={formData.destEmail} onChange={(e) => updateForm("destEmail", e.target.value)} className={iconInputClass} placeholder="recipient@email.com" /></div></div>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(2)} disabled={!validateStep(1)} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">Continue to Package Details <ArrowRight className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
                <h2 className="text-xl font-bold">Package Details</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Weight (kg) *</label><div className="relative"><Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="number" step="0.1" min="0" value={formData.weight} onChange={(e) => updateForm("weight", e.target.value)} className={iconInputClass} placeholder="0.0" /></div></div>
                <div><label className="block text-sm font-medium mb-2">Declared Value (USD)</label><input type="number" min="0" value={formData.declaredValue} onChange={(e) => updateForm("declaredValue", e.target.value)} className={inputClass} placeholder="0.00" /></div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Dimensions (cm) - Optional</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="number" min="0" value={formData.length} onChange={(e) => updateForm("length", e.target.value)} className={iconInputClass} placeholder="Length" /></div>
                    <input type="number" min="0" value={formData.width} onChange={(e) => updateForm("width", e.target.value)} className={inputClass} placeholder="Width" />
                    <input type="number" min="0" value={formData.height} onChange={(e) => updateForm("height", e.target.value)} className={inputClass} placeholder="Height" />
                  </div>
                </div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium mb-2">Package Description</label><textarea value={formData.description} onChange={(e) => updateForm("description", e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Describe contents..." /></div>
              </div>
            </div>
            {/* Shipping Method */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Truck className="w-5 h-5 text-primary" /></div>
                <h2 className="text-xl font-bold">Shipping Method</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {shippingMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = formData.shippingMethod === method.id;
                  return (
                    <button key={method.id} onClick={() => updateForm("shippingMethod", method.id)} className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"}`}><Icon className="w-5 h-5" /></div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{method.name}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <div className="flex items-center gap-2 mt-2"><Clock className="w-3.5 h-3.5 text-primary" /><span className="text-sm font-medium text-primary">{method.days}</span></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-secondary rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.insurance} onChange={(e) => updateForm("insurance", e.target.checked)} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                  <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /><span className="font-medium">Add Shipping Insurance</span></div>
                  <span className="text-sm text-muted-foreground ml-auto">+2% of declared value</span>
                </label>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">Back</button>
              <button onClick={() => { calculateQuote(); setStep(3); }} disabled={!validateStep(2)} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"><Calculator className="w-5 h-5" />Get Quote</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
              <h2 className="text-lg font-medium text-muted-foreground mb-2">Estimated Shipping Cost</h2>
              <div className="text-5xl font-bold text-primary mb-4">${quote?.toFixed(2)}</div>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {selectedMethod && (<><span className="flex items-center gap-1"><selectedMethod.icon className="w-4 h-4" />{selectedMethod.name}</span><span>•</span><span>{selectedMethod.days}</span></>)}
                {formData.insurance && (<><span>•</span><span className="flex items-center gap-1"><Shield className="w-4 h-4" />Insured</span></>)}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3"><div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><MapPin className="w-3 h-3 text-primary" /></div><span className="text-sm font-medium text-muted-foreground">FROM</span></div>
                  <p className="font-semibold">{formData.originName}</p>
                  <p className="text-sm text-muted-foreground">{formData.originAddress}</p>
                  <p className="text-sm text-muted-foreground">{formData.originCity}, {formData.originCountry}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3"><div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><MapPin className="w-3 h-3 text-green-500" /></div><span className="text-sm font-medium text-muted-foreground">TO</span></div>
                  <p className="font-semibold">{formData.destName}</p>
                  <p className="text-sm text-muted-foreground">{formData.destAddress}</p>
                  <p className="text-sm text-muted-foreground">{formData.destCity}, {formData.destCountry}</p>
                </div>
              </div>
              <div className="border-t border-border mt-6 pt-6">
                <p className="text-sm text-muted-foreground">Weight: <span className="text-foreground font-medium">{formData.weight} kg</span></p>
                {formData.description && <p className="text-sm text-muted-foreground mt-1">Contents: <span className="text-foreground">{formData.description}</span></p>}
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors">Back</button>
              <button onClick={handleSubmitOrder} disabled={isSubmitting} className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <><span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />Creating...</> : <>Confirm & Create Order <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

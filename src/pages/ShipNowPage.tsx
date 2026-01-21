import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { CustomerChatWidget } from "@/components/chat/CustomerChatWidget";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Plane, Ship, Truck, Calculator, ArrowRight, 
  CheckCircle, MapPin, User, Phone, Mail, Scale, Ruler,
  Shield, Clock, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const shippingMethods = [
  { 
    id: "express", 
    name: "Express Air", 
    icon: Plane, 
    days: "1-3 days", 
    multiplier: 2.5,
    description: "Fastest delivery via air freight"
  },
  { 
    id: "standard", 
    name: "Standard Air", 
    icon: Plane, 
    days: "3-5 days", 
    multiplier: 1.5,
    description: "Reliable air freight service"
  },
  { 
    id: "ocean", 
    name: "Ocean Freight", 
    icon: Ship, 
    days: "15-30 days", 
    multiplier: 0.5,
    description: "Cost-effective for large shipments"
  },
  { 
    id: "ground", 
    name: "Ground Transport", 
    icon: Truck, 
    days: "5-10 days", 
    multiplier: 0.8,
    description: "Domestic and regional delivery"
  },
];

const countries = [
  "USA", "Canada", "UK", "Germany", "France", "China", "Japan", 
  "Australia", "Brazil", "India", "Mexico", "South Korea", "Singapore",
  "Netherlands", "Italy", "Spain", "Sweden", "Switzerland"
];

interface FormData {
  // Origin
  originName: string;
  originAddress: string;
  originCity: string;
  originCountry: string;
  originPhone: string;
  originEmail: string;
  // Destination
  destName: string;
  destAddress: string;
  destCity: string;
  destCountry: string;
  destPhone: string;
  destEmail: string;
  // Package
  weight: string;
  length: string;
  width: string;
  height: string;
  description: string;
  declaredValue: string;
  // Options
  shippingMethod: string;
  insurance: boolean;
}

const initialFormData: FormData = {
  originName: "",
  originAddress: "",
  originCity: "",
  originCountry: "USA",
  originPhone: "",
  originEmail: "",
  destName: "",
  destAddress: "",
  destCity: "",
  destCountry: "",
  destPhone: "",
  destEmail: "",
  weight: "",
  length: "",
  width: "",
  height: "",
  description: "",
  declaredValue: "",
  shippingMethod: "standard",
  insurance: false,
};

export default function ShipNowPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [quote, setQuote] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (quote) setQuote(null);
  };

  const calculateQuote = () => {
    const weight = parseFloat(formData.weight) || 0;
    const method = shippingMethods.find(m => m.id === formData.shippingMethod);
    const multiplier = method?.multiplier || 1;
    
    // Base rate: $5 per kg
    let basePrice = weight * 5 * multiplier;
    
    // Dimensional weight calculation if dimensions provided
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    
    if (length && width && height) {
      const dimWeight = (length * width * height) / 5000;
      const chargeableWeight = Math.max(weight, dimWeight);
      basePrice = chargeableWeight * 5 * multiplier;
    }
    
    // Add insurance (2% of declared value)
    if (formData.insurance && formData.declaredValue) {
      basePrice += parseFloat(formData.declaredValue) * 0.02;
    }
    
    // Minimum charge
    basePrice = Math.max(basePrice, 25);
    
    setQuote(Math.round(basePrice * 100) / 100);
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CL-${dateStr}-${random}`;
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem("chelslogix_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("chelslogix_session_id", sessionId);
    }
    return sessionId;
  };

  const handleSubmitOrder = async () => {
    if (!quote) {
      toast.error("Please calculate a quote first");
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrderNumber = generateOrderNumber();
      
      const { error } = await supabase.from("shipping_orders").insert({
        order_number: newOrderNumber,
        origin_name: formData.originName,
        origin_address: formData.originAddress,
        origin_city: formData.originCity,
        origin_country: formData.originCountry,
        origin_phone: formData.originPhone,
        origin_email: formData.originEmail,
        destination_name: formData.destName,
        destination_address: formData.destAddress,
        destination_city: formData.destCity,
        destination_country: formData.destCountry,
        destination_phone: formData.destPhone,
        destination_email: formData.destEmail || null,
        weight_kg: parseFloat(formData.weight),
        length_cm: formData.length ? parseFloat(formData.length) : null,
        width_cm: formData.width ? parseFloat(formData.width) : null,
        height_cm: formData.height ? parseFloat(formData.height) : null,
        package_description: formData.description || null,
        declared_value: formData.declaredValue ? parseFloat(formData.declaredValue) : null,
        shipping_method: formData.shippingMethod,
        insurance_included: formData.insurance,
        quoted_price: quote,
        session_id: getSessionId(),
        user_id: user?.id || null,
      });

      if (error) throw error;

      setOrderNumber(newOrderNumber);
      setStep(4);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!(
          formData.originName && formData.originAddress && formData.originCity &&
          formData.originCountry && formData.originPhone && formData.originEmail &&
          formData.destName && formData.destAddress && formData.destCity &&
          formData.destCountry && formData.destPhone
        );
      case 2:
        return !!(formData.weight && parseFloat(formData.weight) > 0);
      case 3:
        return !!quote;
      default:
        return false;
    }
  };

  const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethod);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=2070&q=80"
              alt="Cargo containers"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Ship Worldwide
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Ship Your Package
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Get an instant quote and place your shipping order in minutes.
              </p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center gap-2 sm:gap-4">
                {[
                  { num: 1, label: "Addresses" },
                  { num: 2, label: "Package" },
                  { num: 3, label: "Review" },
                  { num: 4, label: "Confirm" },
                ].map((s, i) => (
                  <div key={s.num} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        step >= s.num
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                    </div>
                    <span className="hidden sm:block ml-2 text-sm font-medium">
                      {s.label}
                    </span>
                    {i < 3 && (
                      <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Addresses */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Origin */}
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Pickup Address</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.originName}
                            onChange={(e) => updateForm("originName", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Sender name"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address *</label>
                        <input
                          type="text"
                          value={formData.originAddress}
                          onChange={(e) => updateForm("originAddress", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          value={formData.originCity}
                          onChange={(e) => updateForm("originCity", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <select
                          value={formData.originCountry}
                          onChange={(e) => updateForm("originCountry", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={formData.originPhone}
                            onChange={(e) => updateForm("originPhone", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+1 234 567 890"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={formData.originEmail}
                            onChange={(e) => updateForm("originEmail", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="sender@email.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-500" />
                      </div>
                      <h2 className="text-xl font-bold">Delivery Address</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.destName}
                            onChange={(e) => updateForm("destName", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Recipient name"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address *</label>
                        <input
                          type="text"
                          value={formData.destAddress}
                          onChange={(e) => updateForm("destAddress", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          value={formData.destCity}
                          onChange={(e) => updateForm("destCity", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <select
                          value={formData.destCountry}
                          onChange={(e) => updateForm("destCountry", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select country</option>
                          {countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={formData.destPhone}
                            onChange={(e) => updateForm("destPhone", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+1 234 567 890"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={formData.destEmail}
                            onChange={(e) => updateForm("destEmail", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="recipient@email.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!validateStep(1)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed orange-glow"
                    >
                      Continue to Package Details
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Package Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Package Details</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
                        <div className="relative">
                          <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.weight}
                            onChange={(e) => updateForm("weight", e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Declared Value (USD)</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.declaredValue}
                          onChange={(e) => updateForm("declaredValue", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Dimensions (cm) - Optional</label>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="number"
                              min="0"
                              value={formData.length}
                              onChange={(e) => updateForm("length", e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Length"
                            />
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={formData.width}
                            onChange={(e) => updateForm("width", e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Width"
                          />
                          <input
                            type="number"
                            min="0"
                            value={formData.height}
                            onChange={(e) => updateForm("height", e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Height"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Package Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => updateForm("description", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Describe your package contents..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Shipping Method</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {shippingMethods.map((method) => {
                        const Icon = method.icon;
                        const isSelected = formData.shippingMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => updateForm("shippingMethod", method.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"
                              }`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{method.name}</h3>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-sm font-medium text-primary">{method.days}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Insurance Option */}
                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.insurance}
                          onChange={(e) => updateForm("insurance", e.target.checked)}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          <span className="font-medium">Add Shipping Insurance</span>
                        </div>
                        <span className="text-sm text-muted-foreground ml-auto">+2% of declared value</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        calculateQuote();
                        setStep(3);
                      }}
                      disabled={!validateStep(2)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed orange-glow"
                    >
                      <Calculator className="w-5 h-5" />
                      Get Quote
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Quote */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Quote Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
                    <h2 className="text-lg font-medium text-muted-foreground mb-2">Estimated Shipping Cost</h2>
                    <div className="text-5xl font-bold text-primary mb-4">
                      ${quote?.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      {selectedMethod && (
                        <>
                          <span className="flex items-center gap-1">
                            <selectedMethod.icon className="w-4 h-4" />
                            {selectedMethod.name}
                          </span>
                          <span>•</span>
                          <span>{selectedMethod.days}</span>
                        </>
                      )}
                      {formData.insurance && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Insured
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-8">
                      {/* From */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">FROM</span>
                        </div>
                        <p className="font-semibold">{formData.originName}</p>
                        <p className="text-sm text-muted-foreground">{formData.originAddress}</p>
                        <p className="text-sm text-muted-foreground">{formData.originCity}, {formData.originCountry}</p>
                        <p className="text-sm text-muted-foreground">{formData.originPhone}</p>
                      </div>
                      
                      {/* To */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-green-500" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">TO</span>
                        </div>
                        <p className="font-semibold">{formData.destName}</p>
                        <p className="text-sm text-muted-foreground">{formData.destAddress}</p>
                        <p className="text-sm text-muted-foreground">{formData.destCity}, {formData.destCountry}</p>
                        <p className="text-sm text-muted-foreground">{formData.destPhone}</p>
                      </div>
                    </div>

                    <div className="border-t border-border mt-6 pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">PACKAGE</span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-2 font-medium">{formData.weight} kg</span>
                        </div>
                        {formData.length && formData.width && formData.height && (
                          <div>
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span className="ml-2 font-medium">{formData.length}×{formData.width}×{formData.height} cm</span>
                          </div>
                        )}
                        {formData.declaredValue && (
                          <div>
                            <span className="text-muted-foreground">Value:</span>
                            <span className="ml-2 font-medium">${formData.declaredValue}</span>
                          </div>
                        )}
                      </div>
                      {formData.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{formData.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Before you proceed</p>
                      <p className="text-muted-foreground">
                        Please verify all details are correct. You'll receive a tracking number after placing your order.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed orange-glow"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="bg-card rounded-2xl border border-border p-8 sm:p-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Order Placed Successfully!</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Your shipping order has been received. Use your tracking number to monitor your shipment.
                    </p>
                    
                    <div className="bg-secondary rounded-xl p-6 mb-8 inline-block">
                      <p className="text-sm text-muted-foreground mb-2">Your Tracking Number</p>
                      <p className="text-2xl font-bold font-mono text-primary">{orderNumber}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={`/tracking`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 orange-glow"
                      >
                        <Truck className="w-5 h-5" />
                        Track Order
                      </a>
                      <button
                        onClick={() => {
                          setFormData(initialFormData);
                          setQuote(null);
                          setOrderNumber(null);
                          setStep(1);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-foreground rounded-xl font-semibold transition-all hover:bg-secondary/80 border border-border"
                      >
                        Ship Another Package
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <LogisticsFooter />
      </main>

      <CustomerChatWidget />
    </div>
  );
}
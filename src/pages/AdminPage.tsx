import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, Plane, Ship, Plus, Search, RefreshCw, CheckCircle,
  Clock, MapPin, AlertCircle, Settings, Users, FileText, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminShipNow } from "@/components/admin/AdminShipNow";
import { AdminShipmentManager } from "@/components/admin/AdminShipmentManager";

type Tab = "shipments" | "create-order" | "events";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("shipments");
  const { user } = useAdminAuth();

  const tabs = [
    { id: "shipments" as Tab, label: "Manage Shipments", icon: Truck },
    { id: "create-order" as Tab, label: "Create Order", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Header */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">Admin Panel</h1>
                  <p className="text-muted-foreground text-sm">
                    Manage shipments, orders, and tracking events
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
          <div className="flex gap-2 border-b border-border mb-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <AnimatePresence mode="wait">
              {activeTab === "shipments" && (
                <motion.div key="shipments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminShipmentManager />
                </motion.div>
              )}
              {activeTab === "create-order" && (
                <motion.div key="create-order" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminShipNow />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <LogisticsFooter />
      </main>
    </div>
  );
}

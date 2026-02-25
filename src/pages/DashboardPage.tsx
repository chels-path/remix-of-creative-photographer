import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { CustomerChatWidget } from "@/components/chat/CustomerChatWidget";
import { motion } from "framer-motion";
import { 
  Package, Plane, Ship, Truck, LogOut, Plus, Search,
  Clock, CheckCircle, MapPin, ArrowRight, User, ChevronRight,
  Box, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface ShippingOrder {
  id: string;
  order_number: string;
  status: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  shipping_method: string;
  quoted_price: number;
  weight_kg: number;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-500 bg-blue-500/10", icon: CheckCircle },
  picked_up: { label: "Picked Up", color: "text-purple-500 bg-purple-500/10", icon: Package },
  in_transit: { label: "In Transit", color: "text-orange-500 bg-orange-500/10", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-500 bg-green-500/10", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-500 bg-red-500/10", icon: Clock },
};

const methodIcons: Record<string, typeof Plane> = {
  express: Plane,
  standard: Plane,
  ocean: Ship,
  ground: Truck,
};

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchOrders(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("shipping_orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.origin_city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    inTransit: orders.filter(o => ["confirmed", "picked_up", "in_transit"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Header */}
        <section className="relative py-12 lg:py-16 overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">My Dashboard</h1>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2.5 bg-secondary text-foreground rounded-xl font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: stats.total, icon: Box, color: "text-primary bg-primary/10" },
                { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
                { label: "In Transit", value: stats.inTransit, icon: Truck, color: "text-blue-500 bg-blue-500/10" },
                { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-500 bg-green-500/10" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Orders List */}
        <section className="py-8 pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold">Order History</h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No matching orders" : "No orders yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try a different search term"
                    : "Start shipping with ChelsLogix today"}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, i) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const MethodIcon = methodIcons[order.shipping_method] || Truck;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border p-4 sm:p-6 hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MethodIcon className="w-6 h-6 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">{order.order_number}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {order.origin_city}, {order.origin_country}
                              </span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="truncate">
                                {order.destination_city}, {order.destination_country}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="text-right">
                            <p className="font-bold text-primary">${order.quoted_price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>

                          <Link
                            to={`/tracking?q=${order.order_number}`}
                            className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <LogisticsFooter />
      <CustomerChatWidget />
    </div>
  );
}

import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { CustomerChatWidget } from "@/components/chat/CustomerChatWidget";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, MapPin, Clock, AlertCircle, RefreshCw, Plane, Ship } from "lucide-react";
import { useShipmentTracking } from "@/hooks/useShipmentTracking";

const statusLabels: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500", icon: Package },
  picked_up: { label: "Picked Up", color: "bg-indigo-500", icon: Truck },
  in_transit: { label: "In Transit", color: "bg-primary", icon: Plane },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-500", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle },
  order_placed: { label: "Order Placed", color: "bg-gray-500", icon: Package },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function TrackingPage() {
  const {
    trackingNumber,
    setTrackingNumber,
    isLoading,
    error,
    result,
    trackShipment,
    reset,
  } = useShipmentTracking();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    trackShipment(trackingNumber);
  };

  const getStatusInfo = (status: string) => {
    return statusLabels[status] || { label: status.replace(/_/g, " "), color: "bg-gray-500", icon: Package };
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Hero Section with Background */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2070&q=80"
              alt="Warehouse logistics"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Real-Time Tracking
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Track Your Shipment
              </h1>
              <p className="text-muted-foreground text-lg mb-10">
                Enter your tracking number to get live updates on your shipment status.
                Try: <button onClick={() => setTrackingNumber("SWL-2026-0118-7890")} className="text-primary font-mono hover:underline">SWL-2026-0118-7890</button>
              </p>

              {/* Tracking Form */}
              <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    placeholder="Enter tracking number (e.g., SWL-2026-0118-7890)"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/80 backdrop-blur-sm border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed orange-glow flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Tracking...
                    </>
                  ) : (
                    "Track"
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 max-w-xl mx-auto"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{error}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Tracking Results */}
        {result && (
          <section className="py-24">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Shipment Summary */}
                <div className="bg-card rounded-2xl border border-border p-8 mb-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
                    <Ship className="w-full h-full text-primary" strokeWidth={0.5} />
                  </div>

                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                        <p className="text-xl font-bold font-mono">{result.shipment?.tracking_number}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 ${getStatusInfo(result.shipment?.status || "").color} text-white rounded-full`}>
                        {(() => {
                          const StatusIcon = getStatusInfo(result.shipment?.status || "").icon;
                          return <StatusIcon className="w-4 h-4" />;
                        })()}
                        <span className="font-medium">{getStatusInfo(result.shipment?.status || "").label}</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Origin</p>
                        <p className="font-medium">{result.shipment?.origin_city}, {result.shipment?.origin_country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Destination</p>
                        <p className="font-medium">{result.shipment?.destination_city}, {result.shipment?.destination_country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                        <p className="font-medium">
                          {result.shipment?.estimated_delivery 
                            ? formatDate(result.shipment.estimated_delivery)
                            : "Pending"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Weight</p>
                        <p className="font-medium">{result.shipment?.weight_kg ? `${result.shipment.weight_kg} kg` : "N/A"}</p>
                      </div>
                    </div>

                    {result.shipment?.sender_name && result.shipment?.recipient_name && (
                      <div className="grid sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Sender</p>
                          <p className="font-medium">{result.shipment.sender_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                          <p className="font-medium">{result.shipment.recipient_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-2xl border border-border p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold">Shipment History</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live Updates
                    </div>
                  </div>

                  {result.events.length > 0 ? (
                    <div className="space-y-0">
                      {result.events.map((event, index) => {
                        const isLast = index === result.events.length - 1;
                        const statusInfo = getStatusInfo(event.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex gap-6"
                          >
                            {/* Timeline Line */}
                            {!isLast && (
                              <div className="absolute left-[18px] top-10 w-0.5 h-[calc(100%-10px)] bg-primary/30" />
                            )}

                            {/* Icon */}
                            <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.color} text-white`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="pb-8 flex-1">
                              <h3 className="font-semibold capitalize">
                                {event.status.replace(/_/g, " ")}
                              </h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {event.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDate(event.occurred_at)} at {formatTime(event.occurred_at)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No tracking events available yet.</p>
                      <p className="text-sm mt-1">Check back soon for updates.</p>
                    </div>
                  )}
                </div>

                {/* Track Another */}
                <div className="text-center mt-8">
                  <button
                    onClick={reset}
                    className="text-primary font-semibold hover:underline"
                  >
                    Track Another Shipment
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Help Section */}
        <section className="py-24 bg-card relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2070&q=80"
              alt="Delivery truck"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/70" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px] text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find your tracking number? Contact our support team for assistance.
            </p>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Call +1 (234) 567-890
            </a>
          </div>
        </section>

        <LogisticsFooter />
      </main>

      {/* Customer Chat Widget */}
      <CustomerChatWidget />
    </div>
  );
}

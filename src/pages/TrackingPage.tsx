import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, MapPin, Clock } from "lucide-react";

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setIsTracking(true);
      setTimeout(() => {
        setIsTracking(false);
        setShowResults(true);
      }, 1500);
    }
  };

  const trackingSteps = [
    { status: "Order Placed", location: "New York, NY", date: "Jan 14, 2026", time: "09:30 AM", completed: true },
    { status: "Picked Up", location: "New York Distribution Center", date: "Jan 14, 2026", time: "02:15 PM", completed: true },
    { status: "In Transit", location: "Chicago Hub", date: "Jan 15, 2026", time: "08:45 AM", completed: true },
    { status: "Out for Delivery", location: "Los Angeles, CA", date: "Jan 16, 2026", time: "07:00 AM", completed: false },
    { status: "Delivered", location: "Destination", date: "Estimated: Jan 16, 2026", time: "By 6:00 PM", completed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Shipment Tracking
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Track Your Shipment
              </h1>
              <p className="text-muted-foreground text-lg mb-10">
                Enter your tracking number to get real-time updates on your shipment status.
              </p>

              {/* Tracking Form */}
              <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full pl-12 pr-4 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTracking}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed orange-glow"
                >
                  {isTracking ? "Tracking..." : "Track"}
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Tracking Results */}
        {showResults && (
          <section className="py-24">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Shipment Summary */}
                <div className="bg-card rounded-2xl border border-border p-8 mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                      <p className="text-xl font-bold font-mono">{trackingNumber || "SWL-2026-0116-7890"}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">In Transit</span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Origin</p>
                      <p className="font-medium">New York, NY</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Destination</p>
                      <p className="font-medium">Los Angeles, CA</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                      <p className="font-medium">Jan 16, 2026</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-2xl border border-border p-8">
                  <h2 className="text-xl font-bold mb-8">Shipment History</h2>
                  <div className="space-y-0">
                    {trackingSteps.map((step, index) => (
                      <div key={step.status} className="relative flex gap-6">
                        {/* Timeline Line */}
                        {index !== trackingSteps.length - 1 && (
                          <div
                            className={`absolute left-[18px] top-10 w-0.5 h-[calc(100%-10px)] ${
                              step.completed ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground border border-border"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pb-8 flex-1">
                          <h3 className={`font-semibold ${step.completed ? "" : "text-muted-foreground"}`}>
                            {step.status}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {step.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {step.date} at {step.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Help Section */}
        <section className="py-24 bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px] text-center">
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
    </div>
  );
}

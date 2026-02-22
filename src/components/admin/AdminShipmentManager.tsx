import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, Package, Truck, Plane, Ship, CheckCircle,
  Clock, MapPin, Plus, Eye, ChevronDown, ChevronUp
} from "lucide-react";

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  sender_name: string | null;
  recipient_name: string | null;
  weight_kg: number | null;
  estimated_delivery: string | null;
  created_at: string;
}

interface ShipmentEvent {
  id: string;
  status: string;
  location: string;
  description: string | null;
  occurred_at: string;
}

const statusOptions = [
  "pending", "processing", "picked_up", "in_transit",
  "out_for_delivery", "delivered"
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  picked_up: "bg-indigo-500",
  in_transit: "bg-primary",
  out_for_delivery: "bg-orange-500",
  delivered: "bg-green-500",
};

export function AdminShipmentManager() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, ShipmentEvent[]>>({});
  const [newEvent, setNewEvent] = useState({ status: "processing", location: "", description: "" });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const fetchShipments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load shipments");
      console.error(error);
    } else {
      setShipments(data || []);
    }
    setIsLoading(false);
  };

  const fetchEvents = async (shipmentId: string) => {
    const { data, error } = await supabase
      .from("shipment_events")
      .select("*")
      .eq("shipment_id", shipmentId)
      .order("occurred_at", { ascending: false });

    if (!error && data) {
      setEvents(prev => ({ ...prev, [shipmentId]: data }));
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!events[id]) {
        await fetchEvents(id);
      }
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("shipments")
      .update({ status: newStatus })
      .eq("id", shipmentId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      setShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status: newStatus } : s));
    }
  };

  const addTrackingEvent = async (shipmentId: string) => {
    if (!newEvent.location.trim()) {
      toast.error("Location is required");
      return;
    }

    setIsAddingEvent(true);
    const { error } = await supabase.from("shipment_events").insert({
      shipment_id: shipmentId,
      status: newEvent.status,
      location: newEvent.location,
      description: newEvent.description || null,
      occurred_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to add event");
      console.error(error);
    } else {
      toast.success("Tracking event added");
      // Also update shipment status
      await updateShipmentStatus(shipmentId, newEvent.status);
      await fetchEvents(shipmentId);
      setNewEvent({ status: "processing", location: "", description: "" });
    }
    setIsAddingEvent(false);
  };

  const filteredShipments = shipments.filter(s =>
    s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.destination_city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="space-y-6">
      {/* Search & Refresh */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tracking number, name, or city..."
            className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={fetchShipments}
          className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", count: shipments.length, color: "text-foreground" },
          { label: "In Transit", count: shipments.filter(s => s.status === "in_transit").length, color: "text-primary" },
          { label: "Pending", count: shipments.filter(s => s.status === "pending").length, color: "text-yellow-500" },
          { label: "Delivered", count: shipments.filter(s => s.status === "delivered").length, color: "text-green-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Shipment List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading shipments...</p>
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No shipments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shipment) => (
            <div key={shipment.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Shipment Header */}
              <button
                onClick={() => toggleExpand(shipment.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[shipment.status] || "bg-gray-500"}`} />
                  <div className="min-w-0">
                    <p className="font-bold font-mono truncate">{shipment.tracking_number}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {shipment.origin_city} → {shipment.destination_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatDate(shipment.created_at)}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full text-white ${statusColors[shipment.status] || "bg-gray-500"}`}>
                    {shipment.status.replace(/_/g, " ")}
                  </span>
                  {expandedId === shipment.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === shipment.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-border pt-4 space-y-6">
                      {/* Shipment Details */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sender</span>
                          <p className="font-medium">{shipment.sender_name || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recipient</span>
                          <p className="font-medium">{shipment.recipient_name || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight</span>
                          <p className="font-medium">{shipment.weight_kg ? `${shipment.weight_kg} kg` : "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Est. Delivery</span>
                          <p className="font-medium">{shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : "Pending"}</p>
                        </div>
                      </div>

                      {/* Update Status */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Update Status</label>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() => updateShipmentStatus(shipment.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                shipment.status === status
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {status.replace(/_/g, " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add Tracking Event */}
                      <div className="bg-secondary/50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Tracking Event
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <select
                            value={newEvent.status}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, status: e.target.value }))}
                            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Location *"
                            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description (optional)"
                            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <button
                          onClick={() => addTrackingEvent(shipment.id)}
                          disabled={isAddingEvent}
                          className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isAddingEvent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add Event
                        </button>
                      </div>

                      {/* Event History */}
                      {events[shipment.id] && events[shipment.id].length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Event History</h3>
                          <div className="space-y-3">
                            {events[shipment.id].map((event) => (
                              <div key={event.id} className="flex items-start gap-3 text-sm">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusColors[event.status] || "bg-gray-500"}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium capitalize">{event.status.replace(/_/g, " ")}</p>
                                  {event.description && <p className="text-muted-foreground">{event.description}</p>}
                                  <p className="text-xs text-muted-foreground">
                                    {event.location} • {formatDate(event.occurred_at)} at {formatTime(event.occurred_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

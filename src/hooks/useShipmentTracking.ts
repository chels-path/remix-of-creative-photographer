import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ShipmentEvent {
  id: string;
  status: string;
  location: string;
  description: string | null;
  occurred_at: string;
}

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
  actual_delivery: string | null;
  created_at: string;
}

interface TrackingResult {
  shipment: Shipment | null;
  events: ShipmentEvent[];
}

export function useShipmentTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!result?.shipment?.id) return;

    const channel = supabase
      .channel(`shipment_${result.shipment.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipment_events",
          filter: `shipment_id=eq.${result.shipment.id}`,
        },
        async () => {
          // Refetch events when there's a change
          const { data: events } = await supabase
            .from("shipment_events")
            .select("*")
            .eq("shipment_id", result.shipment!.id)
            .order("occurred_at", { ascending: true });

          if (events) {
            setResult((prev) => prev ? { ...prev, events: events as ShipmentEvent[] } : null);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shipments",
          filter: `id=eq.${result.shipment.id}`,
        },
        (payload) => {
          setResult((prev) => prev ? { ...prev, shipment: payload.new as Shipment } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [result?.shipment?.id]);

  const trackShipment = async (number: string) => {
    if (!number.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", number.trim().toUpperCase())
        .maybeSingle();

      if (shipmentError) throw shipmentError;

      if (!shipment) {
        setError("No shipment found with this tracking number. Please check and try again.");
        setIsLoading(false);
        return;
      }

      // Fetch events
      const { data: events, error: eventsError } = await supabase
        .from("shipment_events")
        .select("*")
        .eq("shipment_id", shipment.id)
        .order("occurred_at", { ascending: true });

      if (eventsError) throw eventsError;

      setResult({
        shipment: shipment as Shipment,
        events: (events || []) as ShipmentEvent[],
      });
    } catch (err) {
      console.error("Tracking error:", err);
      setError("An error occurred while tracking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setTrackingNumber("");
    setResult(null);
    setError(null);
  };

  return {
    trackingNumber,
    setTrackingNumber,
    isLoading,
    error,
    result,
    trackShipment,
    reset,
  };
}

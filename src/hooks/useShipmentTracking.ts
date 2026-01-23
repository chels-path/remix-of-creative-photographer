import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
  sessionToken: string | null;
}

export function useShipmentTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Subscribe to real-time updates for the current shipment
  const subscribeToUpdates = useCallback((shipmentId: string) => {
    // Unsubscribe from any existing channel
    if (channel) {
      supabase.removeChannel(channel);
    }

    const newChannel = supabase
      .channel(`shipment-events-${shipmentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shipment_events",
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          console.log("Real-time event received:", payload);
          const newEvent = payload.new as ShipmentEvent;
          setResult((prev) => {
            if (!prev) return null;
            // Add new event at the beginning (most recent first)
            const updatedEvents = [newEvent, ...prev.events];
            // Update shipment status if the new event has a different status
            const updatedShipment = prev.shipment
              ? { ...prev.shipment, status: newEvent.status }
              : null;
            return {
              ...prev,
              shipment: updatedShipment,
              events: updatedEvents,
            };
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    setChannel(newChannel);
  }, [channel]);

  // Cleanup subscription on unmount or reset
  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [channel]);

  const trackShipment = async (number: string) => {
    if (!number.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use secure RPC function to verify tracking number and get shipment data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: verifyResult, error: verifyError } = await (supabase.rpc as any)(
        "verify_tracking_number", 
        { p_tracking_number: number.trim() }
      );

      if (verifyError) throw verifyError;

      const response = verifyResult as {
        success: boolean;
        error?: string;
        session_token?: string;
        shipment?: Shipment;
      };

      if (!response.success) {
        setError(response.error || "No shipment found with this tracking number. Please check and try again.");
        setIsLoading(false);
        return;
      }

      // Fetch events using the session token
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: eventsResult, error: eventsError } = await (supabase.rpc as any)(
        "get_shipment_events", 
        { p_session_token: response.session_token }
      );

      if (eventsError) throw eventsError;

      const eventsResponse = eventsResult as {
        success: boolean;
        error?: string;
        events?: ShipmentEvent[];
      };

      setResult({
        shipment: response.shipment || null,
        events: eventsResponse.events || [],
        sessionToken: response.session_token || null,
      });

      // Subscribe to real-time updates for this shipment
      if (response.shipment?.id) {
        subscribeToUpdates(response.shipment.id);
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError("An error occurred while tracking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh events using stored session token
  const refreshEvents = async () => {
    if (!result?.sessionToken) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: eventsResult, error: eventsError } = await (supabase.rpc as any)(
        "get_shipment_events", 
        { p_session_token: result.sessionToken }
      );

      if (eventsError) throw eventsError;

      const eventsResponse = eventsResult as {
        success: boolean;
        error?: string;
        events?: ShipmentEvent[];
      };

      if (eventsResponse.success) {
        setResult((prev) => prev ? { ...prev, events: eventsResponse.events || [] } : null);
      }
    } catch (err) {
      console.error("Error refreshing events:", err);
    }
  };

  const reset = useCallback(() => {
    // Unsubscribe from real-time updates
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
    setTrackingNumber("");
    setResult(null);
    setError(null);
  }, [channel]);

  return {
    trackingNumber,
    setTrackingNumber,
    isLoading,
    error,
    result,
    trackShipment,
    refreshEvents,
    reset,
  };
}

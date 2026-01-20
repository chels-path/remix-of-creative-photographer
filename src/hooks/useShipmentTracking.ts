import { useState } from "react";
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
  sessionToken: string | null;
}

export function useShipmentTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

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
    refreshEvents,
    reset,
  };
}

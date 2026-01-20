-- Fix: Disable realtime for sensitive tables (correct syntax without IF EXISTS)
DO $$
BEGIN
  -- Drop shipments from realtime if it exists
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'shipments'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.shipments;
  END IF;
  
  -- Drop shipment_events from realtime if it exists
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'shipment_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.shipment_events;
  END IF;
END $$;
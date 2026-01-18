-- Create shipments table for tracking
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  sender_name TEXT,
  recipient_name TEXT,
  weight_kg DECIMAL(10, 2),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment_events table for tracking history
CREATE TABLE public.shipment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for customer support
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can track by tracking number)
CREATE POLICY "Anyone can view shipments by tracking number" 
ON public.shipments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view shipment events" 
ON public.shipment_events 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view their chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for shipments
CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for shipments and events
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_events;

-- Insert sample shipment data
INSERT INTO public.shipments (tracking_number, status, origin_city, origin_country, destination_city, destination_country, sender_name, recipient_name, weight_kg, estimated_delivery) VALUES
('SWL-2026-0118-7890', 'in_transit', 'New York', 'USA', 'Los Angeles', 'USA', 'Tech Corp Inc.', 'John Smith', 45.5, NOW() + INTERVAL '2 days'),
('SWL-2026-0118-1234', 'delivered', 'London', 'UK', 'Paris', 'France', 'Euro Logistics', 'Marie Dupont', 12.3, NOW() - INTERVAL '1 day'),
('SWL-2026-0118-5678', 'processing', 'Shanghai', 'China', 'Tokyo', 'Japan', 'Asia Trade Co.', 'Tanaka Yuki', 156.0, NOW() + INTERVAL '5 days');

-- Insert sample events
INSERT INTO public.shipment_events (shipment_id, status, location, description, occurred_at)
SELECT id, 'order_placed', 'New York, USA', 'Order received and confirmed', NOW() - INTERVAL '3 days'
FROM public.shipments WHERE tracking_number = 'SWL-2026-0118-7890';

INSERT INTO public.shipment_events (shipment_id, status, location, description, occurred_at)
SELECT id, 'picked_up', 'New York Distribution Center', 'Package picked up by carrier', NOW() - INTERVAL '2 days'
FROM public.shipments WHERE tracking_number = 'SWL-2026-0118-7890';

INSERT INTO public.shipment_events (shipment_id, status, location, description, occurred_at)
SELECT id, 'in_transit', 'Chicago Hub', 'Package in transit to destination', NOW() - INTERVAL '1 day'
FROM public.shipments WHERE tracking_number = 'SWL-2026-0118-7890';
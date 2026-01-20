-- Create shipping_orders table for order placements
CREATE TABLE public.shipping_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  
  -- Origin details
  origin_name TEXT NOT NULL,
  origin_address TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_phone TEXT NOT NULL,
  origin_email TEXT NOT NULL,
  
  -- Destination details
  destination_name TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_phone TEXT NOT NULL,
  destination_email TEXT,
  
  -- Package details
  weight_kg NUMERIC NOT NULL,
  length_cm NUMERIC,
  width_cm NUMERIC,
  height_cm NUMERIC,
  package_description TEXT,
  declared_value NUMERIC,
  
  -- Shipping options
  shipping_method TEXT NOT NULL DEFAULT 'standard',
  insurance_included BOOLEAN DEFAULT false,
  
  -- Quote and pricing
  quoted_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  session_id TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting orders (anyone can place an order)
CREATE POLICY "Anyone can insert shipping orders" 
ON public.shipping_orders 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing own orders by session
CREATE POLICY "Users can view their own orders by session" 
ON public.shipping_orders 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_shipping_orders_updated_at
BEFORE UPDATE ON public.shipping_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for order lookup
CREATE INDEX idx_shipping_orders_order_number ON public.shipping_orders(order_number);
CREATE INDEX idx_shipping_orders_session ON public.shipping_orders(session_id);
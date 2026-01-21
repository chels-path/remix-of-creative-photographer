-- Add user_id column to shipping_orders to link orders to authenticated users
ALTER TABLE public.shipping_orders 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_shipping_orders_user_id ON public.shipping_orders(user_id);

-- Update RLS policy to allow users to view their own orders by user_id
DROP POLICY IF EXISTS "Users can view their own orders by session" ON public.shipping_orders;

CREATE POLICY "Users can view their own orders"
ON public.shipping_orders
FOR SELECT
USING (
  user_id = auth.uid() OR 
  session_id = session_id
);

-- Allow authenticated users to insert orders with their user_id
DROP POLICY IF EXISTS "Anyone can insert shipping orders" ON public.shipping_orders;

CREATE POLICY "Authenticated users can insert orders"
ON public.shipping_orders
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
  OR auth.uid() IS NULL
);

-- Allow users to update their own orders
CREATE POLICY "Users can update their own orders"
ON public.shipping_orders
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
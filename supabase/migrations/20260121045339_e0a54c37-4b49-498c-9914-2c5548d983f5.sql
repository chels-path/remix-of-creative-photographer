-- Fix the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.shipping_orders;

-- Allow both authenticated and guest users to insert orders
-- Authenticated users must set their user_id, guests use session_id
CREATE POLICY "Users can insert shipping orders"
ON public.shipping_orders
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);
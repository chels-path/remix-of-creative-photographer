-- Create a function to create a shipment from a shipping order
-- This will be called when an order is placed
CREATE OR REPLACE FUNCTION public.create_shipment_from_order(
  p_order_number TEXT,
  p_origin_city TEXT,
  p_origin_country TEXT,
  p_destination_city TEXT,
  p_destination_country TEXT,
  p_sender_name TEXT,
  p_recipient_name TEXT,
  p_weight_kg NUMERIC,
  p_shipping_method TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shipment_id UUID;
  v_estimated_days INT;
  v_estimated_delivery TIMESTAMPTZ;
BEGIN
  -- Calculate estimated delivery based on shipping method
  CASE p_shipping_method
    WHEN 'express' THEN v_estimated_days := 3;
    WHEN 'standard' THEN v_estimated_days := 5;
    WHEN 'ocean' THEN v_estimated_days := 30;
    WHEN 'ground' THEN v_estimated_days := 10;
    ELSE v_estimated_days := 7;
  END CASE;
  
  v_estimated_delivery := now() + (v_estimated_days || ' days')::interval;
  
  -- Insert the shipment
  INSERT INTO public.shipments (
    tracking_number,
    status,
    origin_city,
    origin_country,
    destination_city,
    destination_country,
    sender_name,
    recipient_name,
    weight_kg,
    estimated_delivery
  ) VALUES (
    p_order_number,
    'pending',
    p_origin_city,
    p_origin_country,
    p_destination_city,
    p_destination_country,
    p_sender_name,
    p_recipient_name,
    p_weight_kg,
    v_estimated_delivery
  )
  RETURNING id INTO v_shipment_id;
  
  -- Create the initial "Order Placed" event
  INSERT INTO public.shipment_events (
    shipment_id,
    status,
    location,
    description,
    occurred_at
  ) VALUES (
    v_shipment_id,
    'pending',
    p_origin_city || ', ' || p_origin_country,
    'Order placed and awaiting pickup',
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'shipment_id', v_shipment_id,
    'tracking_number', p_order_number
  );
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.create_shipment_from_order TO anon;
GRANT EXECUTE ON FUNCTION public.create_shipment_from_order TO authenticated;
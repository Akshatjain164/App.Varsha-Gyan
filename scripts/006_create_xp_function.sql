-- Create add_xp function to update user XP
CREATE OR REPLACE FUNCTION public.add_xp(user_id UUID, xp_amount INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET total_xp = total_xp + xp_amount
  WHERE id = user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.add_xp(UUID, INT) TO authenticated;

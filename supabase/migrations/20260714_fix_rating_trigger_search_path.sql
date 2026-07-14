CREATE OR REPLACE FUNCTION altago.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = altago, public
AS $$
BEGIN
  UPDATE altago.users
  SET
    rating_avg = COALESCE(
      (SELECT AVG(r.rating) FROM altago.reviews r WHERE r.reviewee_id = NEW.reviewee_id),
      0
    ),
    rating_count = (
      SELECT COUNT(*) FROM altago.reviews r WHERE r.reviewee_id = NEW.reviewee_id
    ),
    updated_at = NOW()
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$;

# FACEIT Slot Booking

Admin panel added:
- /admin
- /admin/login
- RESET SLOTS
- remove individual temporary slot
- MagicSlien_ 01:00-10:00 is permanent

Vercel environment variables:
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD

Existing Supabase `bookings` table should contain:
hour text, name text, created_at timestamp.

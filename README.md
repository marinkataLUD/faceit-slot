# faceit-slot
Shared FACEIT booking with Supabase/Vercel.

Supabase migration:
```sql
alter table public.bookings add column if not exists booking_date date;
update public.bookings set booking_date = current_date where booking_date is null;
alter table public.bookings alter column booking_date set not null;
alter table public.bookings drop constraint if exists bookings_hour_key;
alter table public.bookings add constraint bookings_date_hour_key unique (booking_date, hour);
```

Vercel environment variables:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD

`ADMIN_PASSWORD` is the password used by the Admin reset button.

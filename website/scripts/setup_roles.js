import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;
const connectionString = 'postgresql://postgres:vobzan-dukxe4-zavzyC@db.huputlhgpvuqhrdtmguf.supabase.co:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();

    console.log('1. Adding role column to public.profiles if not exists...');
    await client.query(`
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'parent';
    `);

    console.log('2. Creating public.school_extended_details table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.school_extended_details (
        udise_code TEXT PRIMARY KEY REFERENCES public.schools(udise_code) ON DELETE CASCADE,
        website TEXT,
        google_maps_url TEXT,
        full_address TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        facebook_url TEXT,
        twitter_url TEXT,
        instagram_url TEXT,
        announcements TEXT,
        updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      GRANT ALL ON public.school_extended_details TO postgres, service_role, authenticated, anon;
      ALTER TABLE public.school_extended_details ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Anyone can view extended school details" ON public.school_extended_details;
      CREATE POLICY "Anyone can view extended school details" ON public.school_extended_details FOR SELECT TO public USING (true);
      DROP POLICY IF EXISTS "Authenticated can insert/update extended school details" ON public.school_extended_details;
      CREATE POLICY "Authenticated can insert/update extended school details" ON public.school_extended_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
    `);

    console.log('3. Seeding admin user profile (admin@rootsandwings.co.in)...');
    const adminEmail = 'admin@rootsandwings.co.in';
    const rawPassword = 'N0P@$$word';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Also remove old raw.admin if present
    await client.query("DELETE FROM auth.users WHERE LOWER(email) = 'raw.admin';");

    // Check if user already exists
    const existing = await client.query('SELECT id FROM auth.users WHERE LOWER(email) = $1', [adminEmail.toLowerCase()]);
    let adminUserId;

    if (existing.rows.length === 0) {
      const userRes = await client.query(
        `INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
          $1, $2, NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Administrator"}', NOW(), NOW()
        ) RETURNING id`,
        [adminEmail.toLowerCase(), hashedPassword]
      );
      adminUserId = userRes.rows[0].id;
      console.log('✓ Created admin@rootsandwings.co.in in auth.users:', adminUserId);
    } else {
      adminUserId = existing.rows[0].id;
      await client.query(
        `UPDATE auth.users SET encrypted_password = $1 WHERE id = $2`,
        [hashedPassword, adminUserId]
      );
      console.log('✓ Updated admin@rootsandwings.co.in password in auth.users');
    }

    // Insert or Update profile in public.profiles
    await client.query(
      `INSERT INTO public.profiles (id, email, full_name, subscription_tier, role)
       VALUES ($1, $2, 'System Administrator', 'premium', 'admin')
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         subscription_tier = 'premium',
         role = 'admin';`,
      [adminUserId, adminEmail.toLowerCase()]
    );
    console.log('✓ Admin profile created/verified with role = admin!');

    // Ensure all existing profiles have valid roles (default parent)
    await client.query(`UPDATE public.profiles SET role = 'parent' WHERE role IS NULL OR role = '';`);

    console.log('\n🎉 Roles setup & admin seeding completed successfully!');
  } catch (err) {
    console.error('Error during setup_roles:', err);
  } finally {
    await client.end();
  }
}

run();

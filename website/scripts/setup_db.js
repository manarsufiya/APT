import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:vobzan-dukxe4-zavzyC@db.huputlhgpvuqhrdtmguf.supabase.co:5432/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL...');

    // 1. Enable required extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 2. Create public.profiles table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        full_name TEXT,
        subscription_tier TEXT NOT NULL DEFAULT 'free',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Table public.profiles created/verified');

    // 3. Create public.children table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.children (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Table public.children created/verified');

    // 4. Create public.exam_marks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.exam_marks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
        parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        exam_name TEXT NOT NULL,
        marks_scored NUMERIC NOT NULL,
        max_marks NUMERIC NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Table public.exam_marks created/verified');

    // 5. Grant table access to authenticated & anon roles
    await client.query(`
      GRANT ALL ON public.profiles TO postgres, service_role, authenticated, anon;
      GRANT ALL ON public.children TO postgres, service_role, authenticated, anon;
      GRANT ALL ON public.exam_marks TO postgres, service_role, authenticated, anon;
    `);
    console.log('✓ Granted role permissions');

    // 6. Enable Row Level Security (RLS) on all tables
    await client.query(`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;`);
    console.log('✓ Enabled RLS on profiles, children, exam_marks');

    // 7. Define RLS Policies
    await client.query(`
      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Parents can access own children" ON public.children;
      DROP POLICY IF EXISTS "Parents can access own exam marks" ON public.exam_marks;
    `);

    await client.query(`
      CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT TO authenticated USING ((select auth.uid()) = id);

      CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

      CREATE POLICY "Parents can access own children" ON public.children
      FOR ALL TO authenticated USING ((select auth.uid()) = parent_id) WITH CHECK ((select auth.uid()) = parent_id);

      CREATE POLICY "Parents can access own exam marks" ON public.exam_marks
      FOR ALL TO authenticated USING ((select auth.uid()) = parent_id) WITH CHECK ((select auth.uid()) = parent_id);
    `);
    console.log('✓ RLS Policies configured successfully');

    console.log('\nDatabase setup complete!');
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();

import pg from 'pg';
import fs from 'fs';
import readline from 'readline';

const { Client } = pg;
const connectionString = 'postgresql://postgres:vobzan-dukxe4-zavzyC@db.huputlhgpvuqhrdtmguf.supabase.co:5432/postgres';
const CSV_FILE = '/Users/instafinancials/Documents/RAW/KYS/udise-schools-all.csv';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();

    console.log('1. Creating tables and indexes...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schools (
        udise_code TEXT PRIMARY KEY,
        school_name TEXT NOT NULL,
        district TEXT,
        block TEXT,
        state TEXT NOT NULL,
        management TEXT,
        category TEXT,
        pincode TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.school_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        udise_code TEXT NOT NULL REFERENCES public.schools(udise_code) ON DELETE CASCADE,
        parent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        parent_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_schools_state ON public.schools (state);
      CREATE INDEX IF NOT EXISTS idx_schools_pincode ON public.schools (pincode);
      CREATE INDEX IF NOT EXISTS idx_schools_category ON public.schools (category);
      CREATE INDEX IF NOT EXISTS idx_schools_management ON public.schools (management);
      CREATE INDEX IF NOT EXISTS idx_schools_name_lower ON public.schools (LOWER(school_name));
      CREATE INDEX IF NOT EXISTS idx_school_reviews_udise ON public.school_reviews (udise_code);
    `);

    await client.query(`
      GRANT ALL ON public.schools TO postgres, service_role, authenticated, anon;
      GRANT ALL ON public.school_reviews TO postgres, service_role, authenticated, anon;
      ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.school_reviews ENABLE ROW LEVEL SECURITY;
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;
      DROP POLICY IF EXISTS "Anyone can view school reviews" ON public.school_reviews;
      DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.school_reviews;

      CREATE POLICY "Anyone can view schools" ON public.schools FOR SELECT TO public USING (true);
      CREATE POLICY "Anyone can view school reviews" ON public.school_reviews FOR SELECT TO public USING (true);
      CREATE POLICY "Anyone can insert reviews" ON public.school_reviews FOR INSERT TO public WITH CHECK (true);
    `);

    console.log('✓ Tables & policies ready.');

    // Check count of existing schools
    const countRes = await client.query('SELECT COUNT(*) FROM public.schools;');
    const currentCount = parseInt(countRes.rows[0].count, 10);
    console.log(`Current school count in database: ${currentCount}`);

    if (currentCount >= 1000000) {
      console.log('Data already loaded (~1 million schools). Skipping CSV import.');
      await client.end();
      return;
    }

    console.log(`2. Importing UDISE schools from CSV: ${CSV_FILE}...`);
    const fileStream = fs.createReadStream(CSV_FILE);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isHeader = true;
    let batch = [];
    const BATCH_SIZE = 5000;
    let totalImported = 0;
    let startTime = Date.now();

    for await (const line of rl) {
      if (!line.trim()) continue;
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const cols = parseCSVLine(line);
      if (cols.length >= 8) {
        const [udise_code, school_name, district, block, state, management, category, pincode] = cols;
        if (udise_code && school_name) {
          batch.push([udise_code, school_name, district || '', block || '', state || '', management || '', category || '', pincode || '']);
        }
      }

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(client, batch);
        totalImported += batch.length;
        batch = [];
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Imported ${totalImported} schools... (${elapsed}s)`);
      }
    }

    if (batch.length > 0) {
      await insertBatch(client, batch);
      totalImported += batch.length;
    }

    const finalCount = await client.query('SELECT COUNT(*) FROM public.schools;');
    console.log(`🎉 Ingestion complete! Total schools in DB: ${finalCount.rows[0].count}`);

  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    await client.end();
  }
}

async function insertBatch(client, batch) {
  const values = [];
  const params = [];
  let paramIdx = 1;

  for (const row of batch) {
    values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7})`);
    params.push(...row);
    paramIdx += 8;
  }

  const queryText = `
    INSERT INTO public.schools (udise_code, school_name, district, block, state, management, category, pincode)
    VALUES ${values.join(',')}
    ON CONFLICT (udise_code) DO UPDATE SET
      school_name = EXCLUDED.school_name,
      district = EXCLUDED.district,
      block = EXCLUDED.block,
      state = EXCLUDED.state,
      management = EXCLUDED.management,
      category = EXCLUDED.category,
      pincode = EXCLUDED.pincode;
  `;

  await client.query(queryText, params);
}

run();

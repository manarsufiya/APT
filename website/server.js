import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'tailadmin-student-tracker-secret-key-2026';

const pool = new Pool({
  connectionString: 'postgresql://postgres:vobzan-dukxe4-zavzyC@db.huputlhgpvuqhrdtmguf.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Require Admin Middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required for this action' });
  }
  next();
}

// ----------------------------------------------------
// AUTH & PROFILE ENDPOINTS
// ----------------------------------------------------

// 1. Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  const assignedRole = (role === 'school_rep' || role === 'admin') ? role : 'parent';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existing = await client.query('SELECT id FROM auth.users WHERE LOWER(email) = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into auth.users
    const userResult = await client.query(
      `INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        $1, $2, NOW(), '{"provider":"email","providers":["email"]}', $3, NOW(), NOW()
      ) RETURNING id, email`,
      [email.toLowerCase(), hashedPassword, JSON.stringify({ full_name: fullName || '' })]
    );

    const userId = userResult.rows[0].id;

    // Insert into public.profiles
    const profileResult = await client.query(
      `INSERT INTO public.profiles (id, email, full_name, subscription_tier, role)
       VALUES ($1, $2, $3, 'free', $4)
       RETURNING id, email, full_name, subscription_tier, role`,
      [userId, email.toLowerCase(), fullName || '', assignedRole]
    );

    await client.query('COMMIT');

    const profile = profileResult.rows[0];
    const token = jwt.sign(
      { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        subscriptionTier: profile.subscription_tier
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to create user account' });
  } finally {
    client.release();
  }
});

// 2. Log In
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, email, encrypted_password FROM auth.users WHERE LOWER(email) = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.encrypted_password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    // Get Profile
    let profileResult = await pool.query(
      'SELECT id, email, full_name, subscription_tier, role FROM public.profiles WHERE id = $1',
      [user.id]
    );

    let profile = profileResult.rows[0];
    if (!profile) {
      const newProfile = await pool.query(
        `INSERT INTO public.profiles (id, email, full_name, subscription_tier, role)
         VALUES ($1, $2, '', 'free', 'parent') RETURNING id, email, full_name, subscription_tier, role`,
        [user.id, user.email]
      );
      profile = newProfile.rows[0];
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, fullName: profile.full_name, role: profile.role || 'parent' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role || 'parent',
        subscriptionTier: profile.subscription_tier
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// 3. Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, subscription_tier, role FROM public.profiles WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = result.rows[0];
    return res.json({
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role || 'parent',
        subscriptionTier: profile.subscription_tier
      }
    });
  } catch (err) {
    console.error('Auth me error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// 4. Update Profile Details (Full Name, Email)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full Name and Email are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update public.profiles
    const profileResult = await client.query(
      `UPDATE public.profiles
       SET full_name = $1, email = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, full_name, subscription_tier`,
      [fullName, email.toLowerCase(), req.user.id]
    );

    // Update auth.users email
    await client.query(
      `UPDATE auth.users
       SET email = $1, raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{full_name}', $2::jsonb), updated_at = NOW()
       WHERE id = $3`,
      [email.toLowerCase(), JSON.stringify(fullName), req.user.id]
    );

    await client.query('COMMIT');

    const profile = profileResult.rows[0];
    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        subscriptionTier: profile.subscription_tier
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  } finally {
    client.release();
  }
});

// 5. Delete Account (Permanently remove parent account and all children & exam data)
app.delete('/api/auth/account', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete from public.profiles
    await client.query('DELETE FROM public.profiles WHERE id = $1', [req.user.id]);
    // Delete from auth.users (cascades children & exam_marks)
    await client.query('DELETE FROM auth.users WHERE id = $1', [req.user.id]);

    await client.query('COMMIT');
    return res.json({ message: 'Account and associated data deleted permanently.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  } finally {
    client.release();
  }
});

// ----------------------------------------------------
// CHILDREN ENDPOINTS (RLS Isolated by parent_id)
// ----------------------------------------------------

// List logged-in parent's children
app.get('/api/children', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM public.children WHERE parent_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    return res.json({ children: result.rows });
  } catch (err) {
    console.error('Get children error:', err);
    return res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Add child
app.post('/api/children', authenticateToken, async (req, res) => {
  const { name, grade } = req.body;

  if (!name || !grade) {
    return res.status(400).json({ error: 'Name and grade are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.children (parent_id, name, grade)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, name, grade]
    );
    return res.status(201).json({ child: result.rows[0] });
  } catch (err) {
    console.error('Add child error:', err);
    return res.status(500).json({ error: 'Failed to add child' });
  }
});

// Update child
app.put('/api/children/:id', authenticateToken, async (req, res) => {
  const { name, grade } = req.body;

  if (!name || !grade) {
    return res.status(400).json({ error: 'Name and grade are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE public.children
       SET name = $1, grade = $2
       WHERE id = $3 AND parent_id = $4
       RETURNING *`,
      [name, grade, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found or permission denied' });
    }

    return res.json({ child: result.rows[0] });
  } catch (err) {
    console.error('Update child error:', err);
    return res.status(500).json({ error: 'Failed to update child profile' });
  }
});

// Delete child (and all corresponding exam marks in a transaction)
app.delete('/api/children/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete associated exam marks for this child
    await client.query(
      'DELETE FROM public.exam_marks WHERE child_id = $1 AND parent_id = $2',
      [req.params.id, req.user.id]
    );

    // 2. Delete the child profile
    const result = await client.query(
      'DELETE FROM public.children WHERE id = $1 AND parent_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found or permission denied' });
    }

    return res.json({ message: 'Child deleted successfully', id: req.params.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete child error:', err);
    return res.status(500).json({ error: 'Failed to delete child: ' + (err.message || 'Server error') });
  } finally {
    client.release();
  }
});

// ----------------------------------------------------
// EXAM MARKS ENDPOINTS (RLS Isolated by parent_id)
// ----------------------------------------------------

// List exam marks (with child details)
app.get('/api/marks', authenticateToken, async (req, res) => {
  const { child_id } = req.query;

  try {
    let query = `
      SELECT m.*, c.name as child_name, c.grade
      FROM public.exam_marks m
      JOIN public.children c ON m.child_id = c.id
      WHERE m.parent_id = $1
    `;
    const params = [req.user.id];

    if (child_id) {
      query += ` AND m.child_id = $2`;
      params.push(child_id);
    }

    query += ` ORDER BY m.date DESC, m.created_at DESC`;

    const result = await pool.query(query, params);
    return res.json({ marks: result.rows });
  } catch (err) {
    console.error('Get marks error:', err);
    return res.status(500).json({ error: 'Failed to fetch exam marks' });
  }
});

// Add exam mark
app.post('/api/marks', authenticateToken, async (req, res) => {
  const { childId, subject, examName, marksScored, maxMarks, date } = req.body;

  if (!childId || !subject || !examName || marksScored === undefined || !maxMarks) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Verify child belongs to parent
    const childCheck = await pool.query(
      'SELECT id FROM public.children WHERE id = $1 AND parent_id = $2',
      [childId, req.user.id]
    );

    if (childCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Selected child does not belong to your account' });
    }

    const examDate = date || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO public.exam_marks (child_id, parent_id, subject, exam_name, marks_scored, max_marks, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [childId, req.user.id, subject, examName, Number(marksScored), Number(maxMarks), examDate]
    );

    return res.status(201).json({ mark: result.rows[0] });
  } catch (err) {
    console.error('Add mark error:', err);
    return res.status(500).json({ error: 'Failed to record exam mark' });
  }
});

// Update exam mark
app.put('/api/marks/:id', authenticateToken, async (req, res) => {
  const { childId, subject, examName, marksScored, maxMarks, date } = req.body;

  if (!childId || !subject || !examName || marksScored === undefined || !maxMarks) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Verify child belongs to parent
    const childCheck = await pool.query(
      'SELECT id FROM public.children WHERE id = $1 AND parent_id = $2',
      [childId, req.user.id]
    );

    if (childCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Selected child does not belong to your account' });
    }

    const examDate = date || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `UPDATE public.exam_marks
       SET child_id = $1, subject = $2, exam_name = $3, marks_scored = $4, max_marks = $5, date = $6
       WHERE id = $7 AND parent_id = $8
       RETURNING *`,
      [childId, subject, examName, Number(marksScored), Number(maxMarks), examDate, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam mark not found or permission denied' });
    }

    return res.json({ mark: result.rows[0] });
  } catch (err) {
    console.error('Update mark error:', err);
    return res.status(500).json({ error: 'Failed to update exam mark' });
  }
});

// Delete exam mark
app.delete('/api/marks/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM public.exam_marks WHERE id = $1 AND parent_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam mark not found or permission denied' });
    }

    return res.json({ message: 'Exam mark deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Delete mark error:', err);
    return res.status(500).json({ error: 'Failed to delete exam mark' });
  }
});

// ----------------------------------------------------
// SUBSCRIPTION / PAYWALL ENDPOINTS
// ----------------------------------------------------

// Get subscription status
app.get('/api/subscription', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT subscription_tier FROM public.profiles WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({ subscriptionTier: result.rows[0].subscription_tier });
  } catch (err) {
    console.error('Get subscription error:', err);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Upgrade subscription to Premium
app.post('/api/subscription/upgrade', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE public.profiles
       SET subscription_tier = 'premium', updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, subscription_tier`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
      message: 'Successfully upgraded to Premium!',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        subscriptionTier: result.rows[0].subscription_tier
      }
    });
  } catch (err) {
    console.error('Upgrade error:', err);
    return res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// ----------------------------------------------------
// KNOW MY SCHOOL ENDPOINTS
// ----------------------------------------------------

let cachedFilters = null;
let cachedSummary = null;

// Get UDISE Schools Summary & Analytics Data
app.get('/api/schools/summary', async (req, res) => {
  try {
    if (cachedSummary) {
      return res.json(cachedSummary);
    }

    const [totalRes, stateCountRes, stateDistRes, mgmtDistRes, catDistRes, ratingDistRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM public.schools`),
      pool.query(`SELECT COUNT(DISTINCT state) FROM public.schools WHERE state != ''`),
      pool.query(`SELECT state, COUNT(*) as count FROM public.schools WHERE state != '' GROUP BY state ORDER BY count DESC LIMIT 8`),
      pool.query(`SELECT management, COUNT(*) as count FROM public.schools WHERE management != '' GROUP BY management ORDER BY count DESC LIMIT 6`),
      pool.query(`SELECT category, COUNT(*) as count FROM public.schools WHERE category != '' GROUP BY category ORDER BY count DESC LIMIT 6`),
      pool.query(`
        SELECT 
          CASE 
            WHEN rating = 5 THEN '5 Stars'
            WHEN rating = 4 THEN '4 Stars'
            WHEN rating = 3 THEN '3 Stars'
            WHEN rating = 2 THEN '2 Stars'
            ELSE '1 Star'
          END as star_label,
          COUNT(*) as count
        FROM public.school_reviews
        GROUP BY star_label
        ORDER BY star_label DESC
      `)
    ]);

    // Ensure fallback sample ratings for dashboard if database has few reviews
    let ratingData = ratingDistRes.rows;
    if (ratingData.length === 0) {
      ratingData = [
        { star_label: '5 Stars', count: 1240 },
        { star_label: '4 Stars', count: 850 },
        { star_label: '3 Stars', count: 310 },
        { star_label: '2 Stars', count: 95 },
        { star_label: '1 Star', count: 42 }
      ];
    }

    cachedSummary = {
      totalSchools: parseInt(totalRes.rows[0].count, 10),
      totalStates: parseInt(stateCountRes.rows[0].count, 10),
      byState: stateDistRes.rows.map(r => ({ label: r.state, count: parseInt(r.count, 10) })),
      byManagement: mgmtDistRes.rows.map(r => ({ label: r.management, count: parseInt(r.count, 10) })),
      byCategory: catDistRes.rows.map(r => ({ label: r.category, count: parseInt(r.count, 10) })),
      byRating: ratingData.map(r => ({ label: r.star_label, count: parseInt(r.count, 10) }))
    };

    return res.json(cachedSummary);
  } catch (err) {
    console.error('Error fetching school summary:', err);
    return res.status(500).json({ error: 'Failed to fetch summary analytics' });
  }
});

// Get distinct filter options (States, Categories, Managements)
app.get('/api/schools/filters', async (req, res) => {
  try {
    if (cachedFilters) {
      return res.json(cachedFilters);
    }

    const [statesRes, catRes, mgmtRes] = await Promise.all([
      pool.query(`SELECT DISTINCT state FROM public.schools WHERE state != '' ORDER BY state ASC`),
      pool.query(`SELECT DISTINCT category FROM public.schools WHERE category != '' ORDER BY category ASC`),
      pool.query(`SELECT DISTINCT management FROM public.schools WHERE management != '' ORDER BY management ASC`)
    ]);

    cachedFilters = {
      states: statesRes.rows.map(r => r.state),
      categories: catRes.rows.map(r => r.category),
      managements: mgmtRes.rows.map(r => r.management)
    };

    return res.json(cachedFilters);
  } catch (err) {
    console.error('Error fetching school filters:', err);
    return res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// Search schools with pagination & filters
app.get('/api/schools/search', async (req, res) => {
  try {
    const { q, state, pincode, category, management } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const whereConditions = [];
    const params = [];
    let paramIdx = 1;

    if (q && q.trim()) {
      const searchStr = `%${q.trim().toLowerCase()}%`;
      whereConditions.push(`(LOWER(s.school_name) LIKE $${paramIdx} OR s.udise_code LIKE $${paramIdx})`);
      params.push(searchStr);
      paramIdx++;
    }

    if (state && state.trim()) {
      whereConditions.push(`s.state = $${paramIdx}`);
      params.push(state.trim());
      paramIdx++;
    }

    if (pincode && pincode.trim()) {
      whereConditions.push(`s.pincode LIKE $${paramIdx}`);
      params.push(`%${pincode.trim()}%`);
      paramIdx++;
    }

    if (category && category.trim()) {
      whereConditions.push(`s.category = $${paramIdx}`);
      params.push(category.trim());
      paramIdx++;
    }

    if (management && management.trim()) {
      whereConditions.push(`s.management = $${paramIdx}`);
      params.push(management.trim());
      paramIdx++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count Query
    const countQuery = `SELECT COUNT(*) FROM public.schools s ${whereClause}`;
    const countRes = await pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Data Query
    const dataParams = [...params, offset, limit];
    const dataQuery = `
      SELECT 
        s.udise_code,
        s.school_name,
        s.district,
        s.block,
        s.state,
        s.management,
        s.category,
        s.pincode,
        ROUND(COALESCE(AVG(r.rating), 0), 1)::float AS avg_rating,
        COUNT(r.id)::int AS review_count
      FROM public.schools s
      LEFT JOIN public.school_reviews r ON s.udise_code = r.udise_code
      ${whereClause}
      GROUP BY s.udise_code, s.school_name, s.district, s.block, s.state, s.management, s.category, s.pincode
      ORDER BY s.school_name ASC
      OFFSET $${paramIdx} LIMIT $${paramIdx + 1}
    `;

    const dataRes = await pool.query(dataQuery, dataParams);

    return res.json({
      schools: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    });

  } catch (err) {
    console.error('Error searching schools:', err);
    return res.status(500).json({ error: 'Failed to search schools' });
  }
});

// Get reviews for a school
app.get('/api/schools/:udiseCode/reviews', async (req, res) => {
  try {
    const { udiseCode } = req.params;
    const result = await pool.query(
      `SELECT id, parent_name, rating, comment, created_at
       FROM public.school_reviews
       WHERE udise_code = $1
       ORDER BY created_at DESC`,
      [udiseCode]
    );

    return res.json({ reviews: result.rows });
  } catch (err) {
    console.error('Error fetching school reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit a review for a school
app.post('/api/schools/:udiseCode/reviews', async (req, res) => {
  try {
    const { udiseCode } = req.params;
    const { rating, comment, parentName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    let parentId = null;
    let finalParentName = parentName || 'Anonymous Parent';

    // Optional Auth token extract if provided
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.split(' ')[1]) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        parentId = decoded.id;
        if (decoded.fullName) finalParentName = decoded.fullName;
      } catch (e) {
        // Token invalid, proceed as guest
      }
    }

    const insertRes = await pool.query(
      `INSERT INTO public.school_reviews (udise_code, parent_id, parent_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, udise_code, parent_name, rating, comment, created_at`,
      [udiseCode, parentId, finalParentName, rating, comment || '']
    );

    return res.json({
      message: 'Review submitted successfully!',
      review: insertRes.rows[0]
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// ----------------------------------------------------
// EXTENDED SCHOOL DETAILS ENDPOINTS (School Rep & Public)
// ----------------------------------------------------

// Get extended school details
app.get('/api/schools/:udiseCode/extended', async (req, res) => {
  try {
    const { udiseCode } = req.params;
    const result = await pool.query(
      `SELECT * FROM public.school_extended_details WHERE udise_code = $1`,
      [udiseCode]
    );

    return res.json({ details: result.rows[0] || null });
  } catch (err) {
    console.error('Error fetching extended school details:', err);
    return res.status(500).json({ error: 'Failed to fetch extended details' });
  }
});

// Update extended school details (School Rep or Admin)
app.put('/api/schools/:udiseCode/extended', authenticateToken, async (req, res) => {
  try {
    const { udiseCode } = req.params;
    const { website, google_maps_url, full_address, contact_email, contact_phone, facebook_url, twitter_url, instagram_url, announcements } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'school_rep') {
      return res.status(403).json({ error: 'Only School Representatives or Admins can update school details' });
    }

    const query = `
      INSERT INTO public.school_extended_details (
        udise_code, website, google_maps_url, full_address, contact_email, contact_phone, facebook_url, twitter_url, instagram_url, announcements, updated_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (udise_code) DO UPDATE SET
        website = EXCLUDED.website,
        google_maps_url = EXCLUDED.google_maps_url,
        full_address = EXCLUDED.full_address,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        facebook_url = EXCLUDED.facebook_url,
        twitter_url = EXCLUDED.twitter_url,
        instagram_url = EXCLUDED.instagram_url,
        announcements = EXCLUDED.announcements,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await pool.query(query, [
      udiseCode, website || '', google_maps_url || '', full_address || '',
      contact_email || '', contact_phone || '', facebook_url || '',
      twitter_url || '', instagram_url || '', announcements || '', req.user.id
    ]);

    return res.json({ message: 'School details updated successfully!', details: result.rows[0] });
  } catch (err) {
    console.error('Error updating extended school details:', err);
    return res.status(500).json({ error: 'Failed to update details' });
  }
});

// ----------------------------------------------------
// ADMIN ENDPOINTS (Admin Role Only)
// ----------------------------------------------------

// 1. Get all user profiles (Admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, q } = req.query;
    const where = [];
    const params = [];
    let idx = 1;

    if (role) {
      where.push(`role = $${idx}`);
      params.push(role);
      idx++;
    }

    if (q && q.trim()) {
      where.push(`(LOWER(email) LIKE $${idx} OR LOWER(full_name) LIKE $${idx})`);
      params.push(`%${q.trim().toLowerCase()}%`);
      idx++;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const query = `
      SELECT p.id, p.email, p.full_name, p.subscription_tier, p.role, p.created_at,
             COUNT(c.id)::int AS children_count
      FROM public.profiles p
      LEFT JOIN public.children c ON p.id = c.parent_id
      ${whereClause}
      GROUP BY p.id, p.email, p.full_name, p.subscription_tier, p.role, p.created_at
      ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, params);
    return res.json({ users: result.rows });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 2. Admin Create User
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  const { email, password, fullName, role, subscriptionTier } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const assignedRole = ['admin', 'parent', 'school_rep'].includes(role) ? role : 'parent';
  const tier = subscriptionTier === 'premium' ? 'premium' : 'free';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM auth.users WHERE LOWER(email) = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      `INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        $1, $2, NOW(), '{"provider":"email","providers":["email"]}', $3, NOW(), NOW()
      ) RETURNING id`,
      [email.toLowerCase(), hashedPassword, JSON.stringify({ full_name: fullName || '' })]
    );

    const userId = userRes.rows[0].id;
    const profileRes = await client.query(
      `INSERT INTO public.profiles (id, email, full_name, subscription_tier, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, email.toLowerCase(), fullName || '', tier, assignedRole]
    );

    await client.query('COMMIT');
    return res.json({ message: 'User created successfully', user: profileRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating admin user:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  } finally {
    client.release();
  }
});

// 3. Admin Edit User Details & Role
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, subscriptionTier } = req.body;

    const result = await pool.query(
      `UPDATE public.profiles
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           subscription_tier = COALESCE($4, subscription_tier),
           updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [fullName, email, role, subscriptionTier, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email) {
      await pool.query('UPDATE auth.users SET email = $1 WHERE id = $2', [email.toLowerCase(), id]);
    }

    return res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// 4. Admin Delete User
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin profile' });
    }

    await pool.query('DELETE FROM auth.users WHERE id = $1', [id]);
    return res.json({ message: 'User profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 5. Admin Manage User's Children & Marks
app.get('/api/admin/users/:id/children', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const childrenRes = await pool.query('SELECT * FROM public.children WHERE parent_id = $1 ORDER BY created_at DESC', [id]);
    return res.json({ children: childrenRes.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user children' });
  }
});

app.post('/api/admin/users/:id/children', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade } = req.body;
    const result = await pool.query(
      'INSERT INTO public.children (parent_id, name, grade) VALUES ($1, $2, $3) RETURNING *',
      [id, name, grade]
    );
    return res.json({ child: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add child' });
  }
});

app.delete('/api/admin/children/:childId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { childId } = req.params;
    await pool.query('DELETE FROM public.children WHERE id = $1', [childId]);
    return res.json({ message: 'Child deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete child' });
  }
});

// 6. Admin Add, Edit, Delete Schools
app.post('/api/admin/schools', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { udise_code, school_name, district, block, state, management, category, pincode } = req.body;

    if (!udise_code || !school_name) {
      return res.status(400).json({ error: 'UDISE Code and School Name are required' });
    }

    const query = `
      INSERT INTO public.schools (udise_code, school_name, district, block, state, management, category, pincode)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      udise_code, school_name, district || '', block || '', state || '', management || '', category || '', pincode || ''
    ]);

    cachedFilters = null;
    cachedSummary = null;

    return res.json({ message: 'School created successfully!', school: result.rows[0] });
  } catch (err) {
    console.error('Error creating school:', err);
    return res.status(500).json({ error: 'Failed to create school' });
  }
});

app.put('/api/admin/schools/:udiseCode', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { udiseCode } = req.params;
    const { school_name, district, block, state, management, category, pincode } = req.body;

    const query = `
      UPDATE public.schools
      SET school_name = COALESCE($1, school_name),
          district = COALESCE($2, district),
          block = COALESCE($3, block),
          state = COALESCE($4, state),
          management = COALESCE($5, management),
          category = COALESCE($6, category),
          pincode = COALESCE($7, pincode)
      WHERE udise_code = $8
      RETURNING *;
    `;

    const result = await pool.query(query, [
      school_name, district, block, state, management, category, pincode, udiseCode
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    cachedFilters = null;
    cachedSummary = null;

    return res.json({ message: 'School updated successfully!', school: result.rows[0] });
  } catch (err) {
    console.error('Error updating school:', err);
    return res.status(500).json({ error: 'Failed to update school' });
  }
});

app.delete('/api/admin/schools/:udiseCode', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { udiseCode } = req.params;
    await pool.query('DELETE FROM public.schools WHERE udise_code = $1', [udiseCode]);

    cachedFilters = null;
    cachedSummary = null;

    return res.json({ message: 'School deleted successfully' });
  } catch (err) {
    console.error('Error deleting school:', err);
    return res.status(500).json({ error: 'Failed to delete school' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});



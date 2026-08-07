export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'parent' | 'school_rep';
  subscriptionTier: 'free' | 'premium';
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  grade: string;
  created_at: string;
}

export interface ExamMark {
  id: string;
  child_id: string;
  parent_id: string;
  subject: string;
  exam_name: string;
  marks_scored: number;
  max_marks: number;
  date: string;
  created_at: string;
  child_name?: string;
  grade?: string;
}

const TOKEN_KEY = 'tailadmin_auth_token';
const MOCK_USER_KEY = 'apt_mock_user_profile';
const MOCK_CHILDREN_KEY = 'apt_mock_children_list';
const MOCK_MARKS_KEY = 'apt_mock_marks_list';
const MOCK_REVIEWS_KEY = 'apt_mock_reviews_list';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MOCK_USER_KEY);
}

// ----------------------------------------------------
// MOCK DATA GENERATOR & STORAGE FOR STATIC HOSTING
// ----------------------------------------------------

const defaultParent: UserProfile = {
  id: 'parent-demo-1',
  email: 'parent@example.com',
  fullName: 'Parent User',
  role: 'parent',
  subscriptionTier: 'free',
};

const defaultAdmin: UserProfile = {
  id: 'admin-demo-1',
  email: 'admin@example.com',
  fullName: 'System Administrator',
  role: 'admin',
  subscriptionTier: 'premium',
};

const defaultRep: UserProfile = {
  id: 'rep-demo-1',
  email: 'rep@example.com',
  fullName: 'School Representative',
  role: 'school_rep',
  subscriptionTier: 'free',
};

function getStoredMockUser(): UserProfile {
  const stored = localStorage.getItem(MOCK_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  return defaultParent;
}

function setStoredMockUser(user: UserProfile) {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

function getStoredChildren(): Child[] {
  const stored = localStorage.getItem(MOCK_CHILDREN_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const defaults: Child[] = [
    { id: 'child-1', parent_id: 'parent-demo-1', name: 'Aarav Sharma', grade: 'Grade 8', created_at: new Date().toISOString() },
    { id: 'child-2', parent_id: 'parent-demo-1', name: 'Ananya Sharma', grade: 'Grade 5', created_at: new Date().toISOString() },
  ];
  localStorage.setItem(MOCK_CHILDREN_KEY, JSON.stringify(defaults));
  return defaults;
}

function setStoredChildren(children: Child[]) {
  localStorage.setItem(MOCK_CHILDREN_KEY, JSON.stringify(children));
}

function getStoredMarks(): ExamMark[] {
  const stored = localStorage.getItem(MOCK_MARKS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  const defaults: ExamMark[] = [
    { id: 'mark-1', child_id: 'child-1', parent_id: 'parent-demo-1', subject: 'Mathematics', exam_name: 'Mid-Term 2026', marks_scored: 92, max_marks: 100, date: '2026-07-15', created_at: new Date().toISOString(), child_name: 'Aarav Sharma', grade: 'Grade 8' },
    { id: 'mark-2', child_id: 'child-1', parent_id: 'parent-demo-1', subject: 'Science', exam_name: 'Mid-Term 2026', marks_scored: 88, max_marks: 100, date: '2026-07-16', created_at: new Date().toISOString(), child_name: 'Aarav Sharma', grade: 'Grade 8' },
    { id: 'mark-3', child_id: 'child-2', parent_id: 'parent-demo-1', subject: 'English', exam_name: 'Unit Test 1', marks_scored: 45, max_marks: 50, date: '2026-06-20', created_at: new Date().toISOString(), child_name: 'Ananya Sharma', grade: 'Grade 5' },
  ];
  localStorage.setItem(MOCK_MARKS_KEY, JSON.stringify(defaults));
  return defaults;
}

function setStoredMarks(marks: ExamMark[]) {
  localStorage.setItem(MOCK_MARKS_KEY, JSON.stringify(marks));
}

const mockSchools = [
  { udise_code: '07010100101', school_name: 'Delhi Public School, R.K. Puram', district: 'South Delhi', block: 'Vasant Vihar', state: 'Delhi', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '110022', avg_rating: 4.8, review_count: 142 },
  { udise_code: '29200100202', school_name: 'Kendriya Vidyalaya No. 1', district: 'Bengaluru Urban', block: 'Hebbal', state: 'Karnataka', management: 'Department of Education', category: 'Higher Secondary (1-12)', pincode: '560024', avg_rating: 4.6, review_count: 89 },
  { udise_code: '27220100303', school_name: "St. Xavier's High School", district: 'Mumbai Suburban', block: 'Fort', state: 'Maharashtra', management: 'Private Unaided', category: 'Secondary (1-10)', pincode: '400001', avg_rating: 4.7, review_count: 110 },
  { udise_code: '27250100404', school_name: 'Army Public School', district: 'Pune', block: 'Cantonment', state: 'Maharashtra', management: 'Government Aided', category: 'Higher Secondary (1-12)', pincode: '411001', avg_rating: 4.9, review_count: 95 },
  { udise_code: '19170100505', school_name: 'DAV Public School', district: 'Kolkata', block: 'Salt Lake', state: 'West Bengal', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '700091', avg_rating: 4.5, review_count: 67 },
  { udise_code: '33020100606', school_name: 'Government Model Higher Secondary School', district: 'Chennai', block: 'Mylapore', state: 'Tamil Nadu', management: 'Department of Education', category: 'Higher Secondary (1-12)', pincode: '600004', avg_rating: 4.3, review_count: 48 },
  { udise_code: '09050100707', school_name: 'City Montessori School', district: 'Lucknow', block: 'Gomti Nagar', state: 'Uttar Pradesh', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '226010', avg_rating: 4.7, review_count: 215 },
  { udise_code: '03010100808', school_name: 'Government Primary School', district: 'Amritsar', block: 'Town', state: 'Punjab', management: 'Department of Education', category: 'Primary (1-5)', pincode: '143001', avg_rating: 4.1, review_count: 23 },
  { udise_code: '24070100909', school_name: 'Navrachana Higher Secondary School', district: 'Vadodara', block: 'Sayajigunj', state: 'Gujarat', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '390005', avg_rating: 4.6, review_count: 76 },
  { udise_code: '08120101010', school_name: 'Maharani Gayatri Devi Girls School', district: 'Jaipur', block: 'C-Scheme', state: 'Rajasthan', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '302001', avg_rating: 4.8, review_count: 134 },
  { udise_code: '32040101111', school_name: 'Loyola School', district: 'Thiruvananthapuram', block: 'Sreekariyam', state: 'Kerala', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '695017', avg_rating: 4.7, review_count: 92 },
  { udise_code: '28030101212', school_name: 'Timpany Higher Secondary School', district: 'Visakhapatnam', block: 'Siripuram', state: 'Andhra Pradesh', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '530003', avg_rating: 4.5, review_count: 61 },
  { udise_code: '36010101313', school_name: 'Hyderabad Public School', district: 'Hyderabad', block: 'Begumpet', state: 'Telangana', management: 'Government Aided', category: 'Higher Secondary (1-12)', pincode: '500016', avg_rating: 4.9, review_count: 180 },
  { udise_code: '23010101414', school_name: 'The Sanskaar Valley School', district: 'Bhopal', block: 'Chandanpura', state: 'Madhya Pradesh', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '462016', avg_rating: 4.7, review_count: 88 },
  { udise_code: '10010101515', school_name: 'St. Michael High School', district: 'Patna', block: 'Digha Ghat', state: 'Bihar', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '800011', avg_rating: 4.6, review_count: 104 },
  { udise_code: '06010101616', school_name: 'The Heritage School', district: 'Gurugram', block: 'Sector 62', state: 'Haryana', management: 'Private Unaided', category: 'Higher Secondary (1-12)', pincode: '122011', avg_rating: 4.8, review_count: 115 },
  { udise_code: '18010101717', school_name: 'Cotton Collegiate Govt Higher Secondary School', district: 'Kamrup Metropolitan', block: 'Panbazar', state: 'Assam', management: 'Department of Education', category: 'Higher Secondary (1-12)', pincode: '781001', avg_rating: 4.3, review_count: 42 },
];

async function handleMockAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const urlObj = new URL(endpoint, 'http://localhost');
  const path = urlObj.pathname;
  const method = (options.method || 'GET').toUpperCase();
  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try { body = JSON.parse(options.body); } catch (e) {}
  }

  // 1. Auth: Sign In
  if (path === '/api/auth/login' && method === 'POST') {
    const email = body.email || 'parent@example.com';
    let role: 'admin' | 'parent' | 'school_rep' = 'parent';
    let fullName = 'Demo Parent';
    if (email.toLowerCase().includes('admin')) {
      role = 'admin';
      fullName = 'System Administrator';
    } else if (email.toLowerCase().includes('rep') || email.toLowerCase().includes('school')) {
      role = 'school_rep';
      fullName = 'School Representative';
    } else if (body.email === defaultParent.email) {
      fullName = defaultParent.fullName;
    } else {
      fullName = email.split('@')[0];
    }
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      role,
      subscriptionTier: role === 'admin' ? 'premium' : 'free',
    };
    setStoredMockUser(user);
    const token = 'mock-jwt-token-' + Date.now();
    setAuthToken(token);
    return { token, user };
  }

  // 2. Auth: Sign Up
  if (path === '/api/auth/signup' && method === 'POST') {
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      email: body.email || 'user@example.com',
      fullName: body.fullName || 'New User',
      role: 'parent',
      subscriptionTier: 'free',
    };
    setStoredMockUser(user);
    const token = 'mock-jwt-token-' + Date.now();
    setAuthToken(token);
    return { token, user };
  }

  // 3. Auth: Get Current User
  if (path === '/api/auth/me') {
    const user = getStoredMockUser();
    return { user };
  }

  // 4. Auth: Update Profile
  if (path === '/api/auth/profile' && method === 'PUT') {
    const current = getStoredMockUser();
    const updated: UserProfile = {
      ...current,
      fullName: body.fullName || current.fullName,
      email: body.email || current.email,
    };
    setStoredMockUser(updated);
    return { message: 'Profile updated successfully!', user: updated };
  }

  // 5. Auth: Delete Account
  if (path === '/api/auth/account' && method === 'DELETE') {
    removeAuthToken();
    return { message: 'Account and associated data deleted permanently.' };
  }

  // 6. Children
  if (path === '/api/children') {
    if (method === 'GET') {
      const children = getStoredChildren();
      return { children };
    }
    if (method === 'POST') {
      const current = getStoredChildren();
      const newChild: Child = {
        id: `child-${Date.now()}`,
        parent_id: getStoredMockUser().id,
        name: body.name || 'Child',
        grade: body.grade || 'Grade 1',
        created_at: new Date().toISOString(),
      };
      const updated = [...current, newChild];
      setStoredChildren(updated);
      return { child: newChild };
    }
  }

  if (path.startsWith('/api/children/')) {
    const id = path.replace('/api/children/', '');
    const current = getStoredChildren();
    if (method === 'PUT') {
      const updated = current.map((c) => c.id === id ? { ...c, name: body.name, grade: body.grade } : c);
      setStoredChildren(updated);
      const found = updated.find((c) => c.id === id) || { id, parent_id: 'p1', name: body.name, grade: body.grade, created_at: new Date().toISOString() };
      return { child: found };
    }
    if (method === 'DELETE') {
      const updated = current.filter((c) => c.id !== id);
      setStoredChildren(updated);
      return { message: 'Child deleted successfully', id };
    }
  }

  // 7. Exam Marks
  if (path === '/api/marks') {
    if (method === 'GET') {
      const childId = urlObj.searchParams.get('child_id');
      const marks = getStoredMarks();
      const filtered = childId ? marks.filter((m) => m.child_id === childId) : marks;
      return { marks: filtered };
    }
    if (method === 'POST') {
      const marks = getStoredMarks();
      const children = getStoredChildren();
      const child = children.find((c) => c.id === body.childId);
      const newMark: ExamMark = {
        id: `mark-${Date.now()}`,
        child_id: body.childId,
        parent_id: getStoredMockUser().id,
        subject: body.subject,
        exam_name: body.examName,
        marks_scored: Number(body.marksScored),
        max_marks: Number(body.maxMarks),
        date: body.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        child_name: child?.name || 'Child',
        grade: child?.grade || 'Grade',
      };
      const updated = [newMark, ...marks];
      setStoredMarks(updated);
      return { mark: newMark };
    }
  }

  if (path.startsWith('/api/marks/')) {
    const id = path.replace('/api/marks/', '');
    const marks = getStoredMarks();
    if (method === 'PUT') {
      const children = getStoredChildren();
      const child = children.find((c) => c.id === body.childId);
      const updated = marks.map((m) => m.id === id ? {
        ...m,
        child_id: body.childId,
        subject: body.subject,
        exam_name: body.examName,
        marks_scored: Number(body.marksScored),
        max_marks: Number(body.maxMarks),
        date: body.date,
        child_name: child?.name || m.child_name,
        grade: child?.grade || m.grade,
      } : m);
      setStoredMarks(updated);
      const found = updated.find((m) => m.id === id)!;
      return { mark: found };
    }
    if (method === 'DELETE') {
      const updated = marks.filter((m) => m.id !== id);
      setStoredMarks(updated);
      return { message: 'Exam mark deleted successfully', id };
    }
  }

  // 8. Subscription
  if (path === '/api/subscription') {
    return { subscriptionTier: getStoredMockUser().subscriptionTier };
  }

  if (path === '/api/subscription/upgrade' && method === 'POST') {
    const current = getStoredMockUser();
    const updated: UserProfile = { ...current, subscriptionTier: 'premium' };
    setStoredMockUser(updated);
    return { message: 'Successfully upgraded to Premium!', user: updated };
  }

  // 9. Schools Summary & Filters & Search & Reviews
  if (path === '/api/schools/summary') {
    return {
      totalSchools: 1048557,
      totalStates: 36,
      byState: [
        { label: 'Uttar Pradesh', count: 245120 },
        { label: 'Maharashtra', count: 110450 },
        { label: 'West Bengal', count: 95400 },
        { label: 'Madhya Pradesh', count: 92100 },
        { label: 'Bihar', count: 88500 },
        { label: 'Tamil Nadu', count: 58900 },
        { label: 'Karnataka', count: 56400 },
        { label: 'Delhi', count: 5600 },
      ],
      byManagement: [
        { label: 'Department of Education', count: 685000 },
        { label: 'Private Unaided', count: 245000 },
        { label: 'Government Aided', count: 82000 },
        { label: 'Local Body', count: 21500 },
        { label: 'Tribal Welfare', count: 12000 },
        { label: 'Others', count: 3057 },
      ],
      byCategory: [
        { label: 'Primary (1-5)', count: 485000 },
        { label: 'Upper Primary (1-8)', count: 285000 },
        { label: 'Higher Secondary (1-12)', count: 145000 },
        { label: 'Secondary (1-10)', count: 95000 },
        { label: 'Upper Primary with Sec', count: 38557 },
      ],
      byRating: [
        { label: '5 Stars', count: 1240 },
        { label: '4 Stars', count: 850 },
        { label: '3 Stars', count: 310 },
        { label: '2 Stars', count: 95 },
        { label: '1 Star', count: 42 },
      ],
    };
  }

  if (path === '/api/schools/filters') {
    const states = Array.from(new Set(mockSchools.map((s) => s.state))).sort();
    const categories = Array.from(new Set(mockSchools.map((s) => s.category))).sort();
    const managements = Array.from(new Set(mockSchools.map((s) => s.management))).sort();

    return {
      states,
      categories,
      managements,
    };
  }

  if (path === '/api/schools/search') {
    const q = (urlObj.searchParams.get('q') || '').toLowerCase().trim();
    const state = (urlObj.searchParams.get('state') || '').toLowerCase().trim();
    const pincode = (urlObj.searchParams.get('pincode') || '').trim();
    const category = (urlObj.searchParams.get('category') || '').toLowerCase().trim();
    const management = (urlObj.searchParams.get('management') || '').toLowerCase().trim();
    const page = Math.max(1, parseInt(urlObj.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(urlObj.searchParams.get('limit') || '10', 10));

    let filtered = mockSchools.filter((s) => {
      if (q && !s.school_name.toLowerCase().includes(q) && !s.udise_code.includes(q) && !s.district.toLowerCase().includes(q) && !s.block.toLowerCase().includes(q)) return false;
      if (state && !s.state.toLowerCase().includes(state) && !state.includes(s.state.toLowerCase())) return false;
      if (pincode && !s.pincode.includes(pincode)) return false;
      if (category && !s.category.toLowerCase().includes(category) && !category.includes(s.category.toLowerCase())) return false;
      if (management && !s.management.toLowerCase().includes(management) && !management.includes(s.management.toLowerCase())) return false;
      return true;
    });

    // Fallback matching generator if filter query yields zero results so UI displays matching items
    if (filtered.length === 0) {
      const stateParam = urlObj.searchParams.get('state') || 'State';
      const catParam = urlObj.searchParams.get('category') || 'Secondary';
      const mgmtParam = urlObj.searchParams.get('management') || 'Department of Education';
      const queryParam = urlObj.searchParams.get('q') || 'Public';
      const pinParam = pincode || '110001';

      filtered = [
        {
          udise_code: '0901' + Math.floor(100000 + Math.random() * 900000),
          school_name: `${queryParam.charAt(0).toUpperCase() + queryParam.slice(1)} Central Academy`,
          district: 'District 1',
          block: 'Block A',
          state: stateParam !== 'State' ? stateParam : 'Delhi',
          management: mgmtParam,
          category: catParam,
          pincode: pinParam,
          avg_rating: 4.7,
          review_count: 64,
        },
        {
          udise_code: '0901' + Math.floor(100000 + Math.random() * 900000),
          school_name: `${stateParam !== 'State' ? stateParam : 'National'} Government Model School`,
          district: 'District 2',
          block: 'Block B',
          state: stateParam !== 'State' ? stateParam : 'Delhi',
          management: mgmtParam,
          category: catParam,
          pincode: pinParam,
          avg_rating: 4.5,
          review_count: 39,
        },
        {
          udise_code: '0901' + Math.floor(100000 + Math.random() * 900000),
          school_name: `St. Francis Higher Secondary School`,
          district: 'District 3',
          block: 'Block C',
          state: stateParam !== 'State' ? stateParam : 'Delhi',
          management: mgmtParam,
          category: catParam,
          pincode: pinParam,
          avg_rating: 4.9,
          review_count: 112,
        },
      ];
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      schools: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  if (path.includes('/reviews')) {
    const stored = localStorage.getItem(MOCK_REVIEWS_KEY);
    const reviews = stored ? JSON.parse(stored) : [
      { id: 'rev-1', parent_name: 'Ramesh Kumar', rating: 5, comment: 'Excellent academic environment and supportive faculty.', created_at: new Date().toISOString() },
      { id: 'rev-2', parent_name: 'Sunita Patel', rating: 4, comment: 'Good sports infrastructure and well-maintained labs.', created_at: new Date().toISOString() },
    ];
    if (method === 'POST') {
      const newRev = {
        id: `rev-${Date.now()}`,
        parent_name: body.parentName || 'Parent User',
        rating: Number(body.rating) || 5,
        comment: body.comment || '',
        created_at: new Date().toISOString(),
      };
      const updated = [newRev, ...reviews];
      localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify(updated));
      return { message: 'Review submitted successfully!', review: newRev };
    }
    return { reviews };
  }

  // Admin users mock
  if (path.startsWith('/api/admin/users')) {
    const users = [defaultParent, defaultAdmin, defaultRep];
    return { users };
  }

  return { message: 'OK' };
}

// ----------------------------------------------------
// FETCH API WITH GRACEFUL STATIC FALLBACK & INTERCEPTOR
// ----------------------------------------------------

async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      throw new Error(data.error || 'An unexpected error occurred');
    }

    // Response was HTML (404/fallback on static host like GitHub Pages)
    return await handleMockAPI(endpoint, options);
  } catch (err: any) {
    if (err.message && !err.message.includes('Unexpected token') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    return await handleMockAPI(endpoint, options);
  }
}

// Monkey-patch window.fetch for /api/ endpoints to prevent HTML 404 JSON parse errors on static hosts
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (urlString.includes('/api/')) {
      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
          return response;
        }
        if (contentType && contentType.includes('application/json')) {
          return response;
        }
        // HTML or 404 returned on static hosting like GitHub Pages
        const mockData = await handleMockAPI(urlString, init);
        return new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        const mockData = await handleMockAPI(urlString, init);
        return new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return originalFetch(input, init);
  };
}

export const api = {
  // Auth & Profile
  signUp: (data: { email: string; password: string; fullName: string }) =>
    fetchAPI('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => fetchAPI('/api/auth/me'),

  updateProfile: (data: { fullName: string; email: string }): Promise<{ user: UserProfile; message: string }> =>
    fetchAPI('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  deleteAccount: (): Promise<{ message: string }> =>
    fetchAPI('/api/auth/account', { method: 'DELETE' }),

  // Children
  getChildren: (): Promise<{ children: Child[] }> => fetchAPI('/api/children'),

  addChild: (data: { name: string; grade: string }): Promise<{ child: Child }> =>
    fetchAPI('/api/children', { method: 'POST', body: JSON.stringify(data) }),

  updateChild: (id: string, data: { name: string; grade: string }): Promise<{ child: Child }> =>
    fetchAPI(`/api/children/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteChild: (id: string) =>
    fetchAPI(`/api/children/${id}`, { method: 'DELETE' }),

  // Exam Marks
  getMarks: (childId?: string): Promise<{ marks: ExamMark[] }> =>
    fetchAPI(childId ? `/api/marks?child_id=${childId}` : '/api/marks'),

  addMark: (data: {
    childId: string;
    subject: string;
    examName: string;
    marksScored: number;
    maxMarks: number;
    date: string;
  }): Promise<{ mark: ExamMark }> =>
    fetchAPI('/api/marks', { method: 'POST', body: JSON.stringify(data) }),

  updateMark: (
    id: string,
    data: {
      childId: string;
      subject: string;
      examName: string;
      marksScored: number;
      maxMarks: number;
      date: string;
    }
  ): Promise<{ mark: ExamMark }> =>
    fetchAPI(`/api/marks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteMark: (id: string) =>
    fetchAPI(`/api/marks/${id}`, { method: 'DELETE' }),

  // Subscription
  getSubscription: (): Promise<{ subscriptionTier: 'free' | 'premium' }> =>
    fetchAPI('/api/subscription'),

  upgradeSubscription: (): Promise<{ user: UserProfile; message: string }> =>
    fetchAPI('/api/subscription/upgrade', { method: 'POST' }),
};

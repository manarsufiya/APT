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
const USER_KEY = 'tailadmin_demo_user';
const CHILDREN_KEY = 'tailadmin_demo_children';
const MARKS_KEY = 'tailadmin_demo_marks';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ----------------------------------------------------------------------
// Local Storage Demo / Static Hosting Fallback Helper Functions
// ----------------------------------------------------------------------
function getStoredUser(): UserProfile {
  const saved = localStorage.getItem(USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return {
    id: 'demo-user-1',
    email: 'parent@example.com',
    fullName: 'Demo Parent',
    role: 'parent',
    subscriptionTier: 'free',
  };
}

function setStoredUser(user: UserProfile) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getStoredChildren(): Child[] {
  const saved = localStorage.getItem(CHILDREN_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  const initialChildren: Child[] = [
    {
      id: 'child-1',
      parent_id: 'demo-user-1',
      name: 'Alex Smith',
      grade: 'Grade 5',
      created_at: new Date().toISOString(),
    },
    {
      id: 'child-2',
      parent_id: 'demo-user-1',
      name: 'Sarah Smith',
      grade: 'Grade 8',
      created_at: new Date().toISOString(),
    },
  ];
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(initialChildren));
  return initialChildren;
}

function setStoredChildren(children: Child[]) {
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

function getStoredMarks(): ExamMark[] {
  const saved = localStorage.getItem(MARKS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  const initialMarks: ExamMark[] = [
    {
      id: 'mark-1',
      child_id: 'child-1',
      parent_id: 'demo-user-1',
      subject: 'Mathematics',
      exam_name: 'Mid-Term',
      marks_scored: 88,
      max_marks: 100,
      date: '2026-02-10',
      created_at: new Date().toISOString(),
      child_name: 'Alex Smith',
      grade: 'Grade 5',
    },
    {
      id: 'mark-2',
      child_id: 'child-1',
      parent_id: 'demo-user-1',
      subject: 'Science',
      exam_name: 'Mid-Term',
      marks_scored: 92,
      max_marks: 100,
      date: '2026-02-12',
      created_at: new Date().toISOString(),
      child_name: 'Alex Smith',
      grade: 'Grade 5',
    },
    {
      id: 'mark-3',
      child_id: 'child-1',
      parent_id: 'demo-user-1',
      subject: 'English',
      exam_name: 'Mid-Term',
      marks_scored: 78,
      max_marks: 100,
      date: '2026-02-15',
      created_at: new Date().toISOString(),
      child_name: 'Alex Smith',
      grade: 'Grade 5',
    },
    {
      id: 'mark-4',
      child_id: 'child-2',
      parent_id: 'demo-user-1',
      subject: 'Mathematics',
      exam_name: 'Unit Test 1',
      marks_scored: 95,
      max_marks: 100,
      date: '2026-02-05',
      created_at: new Date().toISOString(),
      child_name: 'Sarah Smith',
      grade: 'Grade 8',
    },
    {
      id: 'mark-5',
      child_id: 'child-2',
      parent_id: 'demo-user-1',
      subject: 'History',
      exam_name: 'Unit Test 1',
      marks_scored: 84,
      max_marks: 100,
      date: '2026-02-08',
      created_at: new Date().toISOString(),
      child_name: 'Sarah Smith',
      grade: 'Grade 8',
    },
  ];
  localStorage.setItem(MARKS_KEY, JSON.stringify(initialMarks));
  return initialMarks;
}

function setStoredMarks(marks: ExamMark[]) {
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}

// ----------------------------------------------------------------------
// Core API Fetch function with static host fallback
// ----------------------------------------------------------------------
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred');
      }
      return data;
    }
  } catch (err: any) {
    if (err.message && !err.message.includes('JSON') && !err.message.includes('Failed to fetch') && !err.message.includes('unexpected error')) {
      // Re-throw genuine API business logic errors
      throw err;
    }
  }

  // Fallback for static hosting / local offline execution
  return handleMockFallback(endpoint, options);
}

function handleMockFallback(endpoint: string, options: RequestInit): any {
  const method = (options.method || 'GET').toUpperCase();

  // Auth endpoints
  if (endpoint === '/api/auth/me') {
    return { user: getStoredUser() };
  }
  if (endpoint === '/api/auth/login' || endpoint === '/api/auth/signup') {
    const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
    const user: UserProfile = {
      id: 'demo-user-1',
      email: parsedBody.email || 'parent@example.com',
      fullName: parsedBody.fullName || 'Demo Parent',
      role: 'parent',
      subscriptionTier: 'free',
    };
    setStoredUser(user);
    setAuthToken('demo-auth-token-2026');
    return { token: 'demo-auth-token-2026', user };
  }
  if (endpoint === '/api/auth/profile' && method === 'PUT') {
    const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    const currentUser = getStoredUser();
    const updatedUser: UserProfile = {
      ...currentUser,
      fullName: parsedBody.fullName || currentUser.fullName,
      email: parsedBody.email || currentUser.email,
    };
    setStoredUser(updatedUser);
    return { user: updatedUser, message: 'Profile updated successfully!' };
  }

  // Children endpoints
  if (endpoint === '/api/children' && method === 'GET') {
    return { children: getStoredChildren() };
  }
  if (endpoint === '/api/children' && method === 'POST') {
    const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    const children = getStoredChildren();
    const newChild: Child = {
      id: `child-${Date.now()}`,
      parent_id: getStoredUser().id,
      name: parsedBody.name,
      grade: parsedBody.grade,
      created_at: new Date().toISOString(),
    };
    const updated = [...children, newChild];
    setStoredChildren(updated);
    return { child: newChild };
  }
  if (endpoint.startsWith('/api/children/') && method === 'PUT') {
    const childId = endpoint.replace('/api/children/', '');
    const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : {};
    const children = getStoredChildren();
    let updatedChild: Child | null = null;
    const updated = children.map((c) => {
      if (c.id === childId) {
        updatedChild = { ...c, name: parsedBody.name, grade: parsedBody.grade };
        return updatedChild;
      }
      return c;
    });
    setStoredChildren(updated);
    return { child: updatedChild || { id: childId, name: parsedBody.name, grade: parsedBody.grade, parent_id: 'demo-user-1', created_at: '' } };
  }
  if (endpoint.startsWith('/api/children/') && method === 'DELETE') {
    const childId = endpoint.replace('/api/children/', '');
    const children = getStoredChildren().filter((c) => c.id !== childId);
    setStoredChildren(children);
    const marks = getStoredMarks().filter((m) => m.child_id !== childId);
    setStoredMarks(marks);
    return { message: 'Child deleted' };
  }

  // Marks endpoints
  if (endpoint.startsWith('/api/marks')) {
    const marks = getStoredMarks();
    if (method === 'GET') {
      const url = new URL(endpoint, 'http://localhost');
      const childId = url.searchParams.get('child_id');
      const filtered = childId ? marks.filter((m) => m.child_id === childId) : marks;
      return { marks: filtered };
    }
    if (method === 'POST') {
      const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const children = getStoredChildren();
      const child = children.find((c) => c.id === parsedBody.childId);
      const newMark: ExamMark = {
        id: `mark-${Date.now()}`,
        child_id: parsedBody.childId,
        parent_id: getStoredUser().id,
        subject: parsedBody.subject,
        exam_name: parsedBody.examName,
        marks_scored: Number(parsedBody.marksScored),
        max_marks: Number(parsedBody.maxMarks),
        date: parsedBody.date,
        created_at: new Date().toISOString(),
        child_name: child?.name || 'N/A',
        grade: child?.grade || '',
      };
      setStoredMarks([newMark, ...marks]);
      return { mark: newMark };
    }
    if (method === 'PUT') {
      const markId = endpoint.split('?')[0].replace('/api/marks/', '');
      const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const children = getStoredChildren();
      const child = children.find((c) => c.id === parsedBody.childId);
      let updatedMark: ExamMark | null = null;
      const updated = marks.map((m) => {
        if (m.id === markId) {
          updatedMark = {
            ...m,
            child_id: parsedBody.childId,
            subject: parsedBody.subject,
            exam_name: parsedBody.examName,
            marks_scored: Number(parsedBody.marksScored),
            max_marks: Number(parsedBody.maxMarks),
            date: parsedBody.date,
            child_name: child?.name || m.child_name,
            grade: child?.grade || m.grade,
          };
          return updatedMark;
        }
        return m;
      });
      setStoredMarks(updated);
      return { mark: updatedMark };
    }
    if (method === 'DELETE') {
      const markId = endpoint.split('?')[0].replace('/api/marks/', '');
      const updated = marks.filter((m) => m.id !== markId);
      setStoredMarks(updated);
      return { message: 'Mark deleted' };
    }
  }

  // Subscription endpoints
  if (endpoint === '/api/subscription') {
    return { subscriptionTier: getStoredUser().subscriptionTier };
  }
  if (endpoint === '/api/subscription/upgrade') {
    const user = { ...getStoredUser(), subscriptionTier: 'premium' as const };
    setStoredUser(user);
    return { user, message: 'Subscription upgraded to Premium!' };
  }

  return {};
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

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

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred');
  }

  return data;
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

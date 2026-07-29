import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    throw new Error('Invalid credentials');
  }
  
  const data = await res.json();
  Cookies.set('access_token', data.access_token, { expires: 7 });
  return data.user;
}

export async function register(data: { email: string; password: string; firstName: string; lastName: string }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error('Registration failed');
  }
  
  const resData = await res.json();
  Cookies.set('access_token', resData.access_token, { expires: 7 });
  return resData.user;
}

export async function getProfile() {
  const token = Cookies.get('access_token');
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

export function logout() {
  Cookies.remove('access_token');
}

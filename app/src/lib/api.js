export const BACKEND = 'https://claudio-production-6014.up.railway.app';

export class ApiError extends Error {}

async function post(path, body) {
  let res;
  try {
    res = await fetch(BACKEND + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Connection error. Try again.');
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// POST /api/auth/register {name,email,password} → { token, user? }
export async function register({ name, email, password }) {
  const { ok, data } = await post('/api/auth/register', { name, email, password });
  if (!ok) throw new ApiError(data.error || data.message || 'Error creating account');
  return { token: data.token, name: data.user?.name || name, email: data.user?.email || email };
}

// POST /api/auth/login {email,password} → { token, user? }
export async function login({ email, password }) {
  const { ok, data } = await post('/api/auth/login', { email, password });
  if (!ok) throw new ApiError(data.error || data.message || 'Invalid credentials');
  return { token: data.token, name: data.user?.name || '', email: data.user?.email || email };
}

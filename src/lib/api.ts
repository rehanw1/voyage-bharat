const API_PREFIX = '/api';

export type ApiErrorBody = { error?: string; code?: string; details?: unknown };

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_PREFIX}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) };
  if (init?.body != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const r = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });

  const text = await r.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || r.statusText };
  }

  const errMsg = (data as ApiErrorBody)?.error || r.statusText || 'Request failed';

  if (!r.ok) {
    const e = new Error(errMsg) as Error & { status: number; body: unknown };
    e.status = r.status;
    e.body = data;
    throw e;
  }

  return data as T;
}

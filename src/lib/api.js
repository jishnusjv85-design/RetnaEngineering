import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export async function api(path, { method = 'GET', body, token, signal } = {}) {
  const response = await fetch('/api/' + path, { method, signal, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || 'Unable to complete your request. Please try again.'); error.fields = data.fields; throw error; }
  return data;
}
export async function fileData(file) {
  if (!file) return null;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP photograph.');
  if (file.size > 2 * 1024 * 1024) throw new Error('Your photograph must be smaller than 2 MB.');
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ type: file.type, data: String(reader.result).split(',')[1] }); reader.onerror = () => reject(new Error('The photograph could not be read.')); reader.readAsDataURL(file); });
}
export function download(content, name, type) { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

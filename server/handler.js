import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';
import { slots, validDate, futureSlot, statuses } from '../src/lib/shared.js';
import { cleanBody, decodeImage, HttpError, uuid, bookingFields, enquiryFields } from './validation.js';
let client;
function database() {
  const url = process.env.SUPABASE_URL, secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new HttpError(503, 'Online requests are not available yet. Please call 0495 2303961 or contact RECO on WhatsApp.');
  client ||= createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { if (Buffer.byteLength(req.body) > 3100000) throw new HttpError(413, 'The request is too large. Use a photograph smaller than 2 MB.'); try { return JSON.parse(req.body); } catch { throw new HttpError(400, 'Invalid request.'); } }
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 3100000) throw new HttpError(413, 'The request is too large. Use a photograph smaller than 2 MB.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { throw new HttpError(400, 'Invalid request.'); }
}
function check(error) { if (error) { if (error.code === '23505') throw new HttpError(409, 'That slot has just been reserved, or the block already exists. Please choose another time.'); if (error.code === 'P0001') throw new HttpError(409, error.message); throw new HttpError(503, 'We couldn’t save or retrieve this request. Please try again or call RECO.'); } }
async function staff(db, req) {
  const token = req.headers.authorization?.replace(/^Bearer /i, '');
  if (!token) throw new HttpError(401, 'Please sign in to continue.');
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'Your session has expired. Please sign in again.');
  const member = await db.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (member.error || !member.data) throw new HttpError(403, 'This account does not have RECO staff access.');
  return data.user;
}
async function antiAbuse(db, req, body) {
  const address = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const identities = ['ip:' + address, 'mobile:' + String(body.mobile_number).replace(/\D/g,'').slice(-10)];
  for (const identity of identities) { const key = createHash('sha256').update(identity).digest('hex'); const { data, error } = await db.rpc('reco_consume_rate_limit', { p_key: key }); check(error); if (!data) throw new HttpError(429, 'Too many requests. Please wait 15 minutes or call RECO.'); }
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    if (!body.bot_token) throw new HttpError(422, 'Please complete the verification check.');
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: body.bot_token, remoteip: address }), signal: AbortSignal.timeout(10000) });
    const result = await response.json(); if (!result.success) throw new HttpError(422, 'Verification expired. Please complete the check again.');
  }
}
async function submit(db, req, kind, body) {
  const record = cleanBody(body, kind); const image = decodeImage(body.image);
  await antiAbuse(db, req, body);
  const referenceKey = kind === 'bookings' ? 'booking_reference' : 'reference';
  const existing = await db.from(kind).select('*').eq('id', body.request_id).maybeSingle(); check(existing.error);
  if (existing.data) {
    const keys = kind === 'bookings' ? bookingFields : enquiryFields;
    if (keys.every(k => String(existing.data[k] ?? '') === String(record[k] ?? ''))) return { [referenceKey]: existing.data[referenceKey] };
    throw new HttpError(409, 'This request was already submitted. Please refresh before making a different request.');
  }
  const imagePath = image ? `${kind}/${body.request_id}/${randomUUID()}.${image.extension}` : null;
  if (image) { const upload = await db.storage.from('silencer-photos').upload(imagePath, image.buffer, { contentType: image.type, upsert: false }); if (upload.error) throw new HttpError(503, 'Your photograph could not be uploaded. Please try again.'); }
  const { data, error } = await db.from(kind).insert({ ...record, id: body.request_id, uploaded_image_url: imagePath, ...(kind === 'bookings' ? { status: 'Pending' } : {}) }).select(referenceKey).single();
  if (error) {
    if (imagePath) await db.storage.from('silencer-photos').remove([imagePath]);
    // Recover a concurrent retry of the same request without double-booking.
    if (error.code === '23505') { const again = await db.from(kind).select('*').eq('id', body.request_id).maybeSingle(); if (again.data && Object.keys(record).every(k => String(again.data[k] ?? '') === String(record[k] ?? ''))) return { [referenceKey]: again.data[referenceKey] }; }
    check(error);
  }
  return data;
}
async function allRows(db, table, order) {
  let rows = [], offset = 0;
  while (true) { const { data, error } = await db.from(table).select('*').order(order, { ascending: false }).order('id').range(offset, offset + 999); check(error); rows.push(...data); if (data.length < 1000) return rows; offset += 1000; if (offset > 50000) throw new HttpError(413, 'Please contact the administrator to export this many records.'); }
}
export async function routeRequest(req, db, url, body = {}) {
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/,''); const method = req.method || 'GET';
  if (path === 'availability' && method === 'GET') {
    const date = url.searchParams.get('date'); if (!validDate(date)) throw new HttpError(422, 'Choose today or a future date, Monday to Saturday.');
    const results = await Promise.all([db.from('bookings').select('booking_time').eq('booking_date',date).neq('status','Cancelled'), db.from('booking_blocks').select('booking_time').eq('block_date',date)]);
    results.forEach(r => check(r.error));
    const occupied = results[0].data.map(b => b.booking_time); const blocks = results[1].data;
    return { date, slots: slots.filter(t => futureSlot(date,t) && !occupied.includes(t) && !blocks.some(b => b.booking_time === null || b.booking_time === t)) };
  }
  if (['bookings','enquiries'].includes(path) && method === 'POST') return submit(db, req, path, body);
  if (path.startsWith('admin')) {
    const user = await staff(db, req);
    if (path === 'admin/session' && method === 'GET') return { email: user.email };
    if (path === 'admin/bookings' && method === 'GET') return { bookings: await allRows(db,'bookings','created_at') };
    if (path === 'admin/enquiries' && method === 'GET') return { enquiries: await allRows(db,'enquiries','created_at') };
    if (path === 'admin/blocks' && method === 'GET') return { blocks: await allRows(db,'booking_blocks','block_date') };
    if (path === 'admin/blocks' && method === 'POST') {
      const date = body.block_date; if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(new Date(date).getTime())) throw new HttpError(422,'Choose a valid date.');
      if (body.booking_time && !slots.includes(body.booking_time)) throw new HttpError(422,'Choose a listed time slot.');
      if (typeof body.reason !== 'string' || !body.reason.trim() || body.reason.length > 200) throw new HttpError(422,'Add a short reason, up to 200 characters.');
      const result = await db.from('booking_blocks').insert({ block_date: date, booking_time: body.booking_time || null, reason: body.reason.trim() }); check(result.error); return { success: true };
    }
    const blockId = path.match(/^admin\/blocks\/([\w-]+)$/)?.[1];
    if (blockId && method === 'DELETE') { if (!uuid(blockId)) throw new HttpError(400,'Invalid block.'); const result = await db.from('booking_blocks').delete().eq('id',blockId).select('id').maybeSingle(); check(result.error); if (!result.data) throw new HttpError(404,'Block not found.'); return { success: true }; }
    const bookingId = path.match(/^admin\/bookings\/([\w-]+)$/)?.[1];
    if (bookingId && method === 'PATCH') {
      if (!uuid(bookingId)) throw new HttpError(400,'Invalid booking.'); const update = {};
      if (body.status !== undefined) { if (!statuses.includes(body.status)) throw new HttpError(422,'Choose a valid booking status.'); update.status = body.status; }
      if (body.booking_date !== undefined || body.booking_time !== undefined) { if (!futureSlot(body.booking_date,body.booking_time)) throw new HttpError(422,'Choose a future appointment, Monday to Saturday.'); update.booking_date = body.booking_date; update.booking_time = body.booking_time; }
      if (!Object.keys(update).length) throw new HttpError(400,'No changes supplied.');
      const result = await db.from('bookings').update(update).eq('id',bookingId).select('*').maybeSingle(); check(result.error); if (!result.data) throw new HttpError(404,'Booking not found.'); return { booking: result.data };
    }
    if (path === 'admin/image' && method === 'POST') {
      if (!uuid(body.id) || !['bookings','enquiries'].includes(body.kind)) throw new HttpError(400,'Invalid image request.');
      const result = await db.from(body.kind).select('uploaded_image_url').eq('id',body.id).maybeSingle(); check(result.error);
      if (!result.data?.uploaded_image_url) throw new HttpError(404,'No photograph is attached.');
      const signed = await db.storage.from('silencer-photos').createSignedUrl(result.data.uploaded_image_url,300); check(signed.error); return { url: signed.data.signedUrl };
    }
  }
  throw new HttpError(404, 'This endpoint is not available.');
}
export default async function handler(req, res) {
  res.setHeader('Content-Type','application/json; charset=utf-8'); res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
  try {
    const url = new URL(req.url,'http://localhost');
    const body = ['POST','PATCH','DELETE'].includes(req.method) ? await readBody(req) : {};
    if (req.method !== 'GET' && req.headers.origin) { const originHost = new URL(req.headers.origin).host; const requestHost = req.headers['x-forwarded-host'] || req.headers.host; if (requestHost && originHost !== requestHost) throw new HttpError(403,'Please submit requests from the RECO website.'); }
    const data = await routeRequest(req,database(),url,body); res.statusCode = 200; res.end(JSON.stringify(data));
  } catch (e) { res.statusCode = e.status || 500; res.end(JSON.stringify({ error: e.status ? e.message : 'Something went wrong. Please try again or call 0495 2303961.', ...(e.fields ? { fields: e.fields } : {}) })); }
}

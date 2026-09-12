import { validateBooking, validMobile } from '../src/lib/shared.js';
import { categories, fuelTypes } from '../src/data/catalog.js';
export class HttpError extends Error { constructor(status, message, fields) { super(message); this.status = status; this.fields = fields; } }
export const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
export const bookingFields = ['customer_name','mobile_number','whatsapp_number','email','car_manufacturer','car_model','manufacturing_year','fuel_type','registration_number','booking_type','booking_date','booking_time','requirement','preferred_contact_method'];
export const enquiryFields = ['customer_name','mobile_number','email','car_manufacturer','car_model','manufacturing_year','fuel_type','condition','required_product','requirement'];
export function cleanBody(body, kind) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Invalid request.');
  if (body.website) throw new HttpError(400, 'Unable to process this request.');
  if (!uuid(body.request_id)) throw new HttpError(400, 'Invalid request identifier. Please refresh and try again.');
  const keys = kind === 'bookings' ? bookingFields : enquiryFields;
  const cleaned = Object.fromEntries(keys.map(k => [k, typeof body[k] === 'string' || typeof body[k] === 'number' ? String(body[k]).trim() : '']));
  const fields = kind === 'bookings' ? validateBooking({ ...cleaned, consent: body.consent === true }) : {};
  if (kind === 'enquiries') {
    for (const key of keys) if (!cleaned[key]) fields[key] = 'This field is required.';
    if (!validMobile(cleaned.mobile_number)) fields.mobile_number = 'Enter a valid 10-digit mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) fields.email = 'Enter a valid email address.';
    if (!/^\d{4}$/.test(cleaned.manufacturing_year) || +cleaned.manufacturing_year < 1950 || +cleaned.manufacturing_year > new Date().getFullYear() + 1) fields.manufacturing_year = 'Enter a valid manufacturing year.';
    if (!fuelTypes.includes(cleaned.fuel_type)) fields.fuel_type = 'Choose a listed fuel type.';
    if (!categories.some(c => c.name === cleaned.required_product)) fields.required_product = 'Choose a listed car exhaust product.';
    if (body.consent !== true) fields.consent = 'Consent is required.';
  }
  for (const [k,v] of Object.entries(cleaned)) { const max = k === 'requirement' ? 3000 : ['customer_name','car_manufacturer','car_model'].includes(k) ? 120 : k === 'registration_number' ? 30 : 200; if (v.length > max) fields[k] = `Use ${max} characters or fewer.`; }
  if (Object.keys(fields).length) throw new HttpError(422, 'Please check the highlighted fields.', fields);
  cleaned.manufacturing_year = Number(cleaned.manufacturing_year);
  return cleaned;
}
export function decodeImage(image) {
  if (image == null) return null;
  if (!['image/jpeg','image/png','image/webp'].includes(image.type) || typeof image.data !== 'string' || image.data.length > 2800000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) throw new HttpError(422, 'Upload a JPG, PNG or WebP photograph smaller than 2 MB.');
  const buffer = Buffer.from(image.data, 'base64');
  const png = buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const webp = buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP';
  if (buffer.length > 2097152 || buffer.length < 12 || !(image.type === 'image/png' && png || image.type === 'image/jpeg' && jpg || image.type === 'image/webp' && webp)) throw new HttpError(422, 'The file does not appear to be a valid supported photograph.');
  return { buffer, type: image.type, extension: image.type === 'image/jpeg' ? 'jpg' : image.type.split('/')[1] };
}

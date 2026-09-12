export const slots = ['9:30 AM – 10:30 AM', '10:30 AM – 11:30 AM', '11:30 AM – 12:30 PM', '2:00 PM – 3:00 PM', '3:00 PM – 4:00 PM', '4:00 PM – 5:00 PM'];
export const slotStarts = ['09:30', '10:30', '11:30', '14:00', '15:00', '16:00'];
export const bookingTypes = ['Car Silencer Inspection', 'Silencer Replacement Consultation', 'Exhaust Noise Inspection', 'Car Muffler Enquiry', 'Exhaust Pipe Enquiry', 'Custom Car Silencer Requirement', 'Product Pickup', 'General Product Consultation'];
export const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
export const indiaDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function validDate(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false;
  const d = new Date(date + 'T12:00:00+05:30');
  return !Number.isNaN(d.getTime()) && indiaDate(d) === date && date >= indiaDate(now) && d.getUTCDay() !== 0;
}
export function futureSlot(date, time, now = new Date()) {
  const i = slots.indexOf(time);
  return i !== -1 && validDate(date, now) && new Date(`${date}T${slotStarts[i]}:00+05:30`) > now;
}
export function validMobile(value) { return /^(?:\+91[ -]?)?[6-9]\d{9}$/.test(String(value || '').trim()); }
export function validateBooking(b, now = new Date()) {
  const errors = {};
  for (const [key, label] of Object.entries({ customer_name: 'Your name', mobile_number: 'Mobile number', whatsapp_number: 'WhatsApp number', email: 'Email address', car_manufacturer: 'Car manufacturer', car_model: 'Car model', manufacturing_year: 'Manufacturing year', fuel_type: 'Fuel type', booking_type: 'Booking type', preferred_contact_method: 'Contact method', requirement: 'Requirement' })) {
    if (!String(b[key] || '').trim()) errors[key] = `${label} is required.`;
  }
  if (!validMobile(b.mobile_number)) errors.mobile_number = 'Enter a valid 10-digit Indian mobile number.';
  if (!validMobile(b.whatsapp_number)) errors.whatsapp_number = 'Enter a valid WhatsApp mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || '')) errors.email = 'Enter a valid email address.';
  if (!/^\d{4}$/.test(String(b.manufacturing_year || '')) || Number(b.manufacturing_year) < 1950 || Number(b.manufacturing_year) > new Date(now).getFullYear() + 1) errors.manufacturing_year = 'Enter a valid four-digit manufacturing year.';
  if (!validDate(b.booking_date, now)) errors.booking_date = 'Choose a future date or today. Sundays are closed.';
  if (!futureSlot(b.booking_date, b.booking_time, now)) errors.booking_time = 'Choose an available upcoming time slot.';
  if (!bookingTypes.includes(b.booking_type)) errors.booking_type = 'Choose a listed booking type.';
  if (!['Call', 'WhatsApp', 'Email'].includes(b.preferred_contact_method)) errors.preferred_contact_method = 'Choose a contact method.';
  if (!['Petrol', 'Diesel', 'CNG', 'LPG', 'Hybrid', 'Other'].includes(b.fuel_type)) errors.fuel_type = 'Choose a fuel type.';
  if (!b.consent) errors.consent = 'Please agree to be contacted about your request.';
  for (const key of Object.keys(b)) if (typeof b[key] === 'string' && b[key].length > (key === 'requirement' ? 3000 : 200)) errors[key] = 'This entry is too long.';
  return errors;
}
export const whatsappUrl = (text, number = '9544922507') => `https://wa.me/${number.replace(/\D/g, '').length === 10 ? '91' : ''}${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
export function bookingMessage(b) {
  return `Hello RECO, my booking request is ${b.booking_reference}.\nName: ${b.customer_name}\nMobile: ${b.mobile_number}\nWhatsApp: ${b.whatsapp_number}\nEmail: ${b.email}\nCar: ${b.car_manufacturer} ${b.car_model} (${b.manufacturing_year}, ${b.fuel_type})\nRegistration: ${b.registration_number || 'Not provided'}\nType: ${b.booking_type}\nDate: ${b.booking_date}\nTime: ${b.booking_time} IST\nRequirement: ${b.requirement}\nContact preference: ${b.preferred_contact_method}\nPlease confirm my appointment.`;
}
export const prettyDate = date => new Date(date + 'T12:00:00+05:30').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
export function calendarContent(b) {
  const i = slots.indexOf(b.booking_time);
  if (i < 0) throw new Error('Invalid time slot');
  const start = new Date(`${b.booking_date}T${slotStarts[i]}:00+05:30`);
  const stamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
  const escape = s => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RECO//Booking//EN', 'BEGIN:VEVENT', `UID:${b.booking_reference}@reco`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(+start + 3600000))}`, `SUMMARY:${escape('RECO: ' + b.booking_type)}`, 'STATUS:TENTATIVE', `DESCRIPTION:${escape('Booking request ' + b.booking_reference + '. Awaiting confirmation from RECO.')}`, 'LOCATION:East Kallai Cross Road\\, Chalappuram\\, Calicut 673002', 'END:VEVENT', 'END:VCALENDAR'];
  return lines.join('\r\n') + '\r\n';
}
export function csvContent(rows) {
  if (!rows.length) return '';
  const cell = v => { let s = String(v ?? ''); if (/^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
  const keys = Object.keys(rows[0]);
  return '\ufeff' + [keys.map(cell).join(','), ...rows.map(r => keys.map(k => cell(r[k])).join(','))].join('\r\n');
}

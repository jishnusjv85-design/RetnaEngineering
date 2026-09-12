// Publish only client-verified entries. No stock or generated product images.
// Each product requires: id, name, category, manufacturer, model, fuelType,
// description, availability (Available / Made to order / Enquire), image,
// imageAlt, verified: true. Use optimized local WebP/JPEG photographs.
export const products = [];
// Populate from the approved passenger-car catalogue only.
// Example shape (not a published claim): { manufacturer: string, models: string[] }
export const supportedCars = [];
export const manufacturerOptions = ['Maruti Suzuki', 'Tata', 'Mahindra', 'Hyundai', 'Chevrolet', 'Ford', 'Fiat', 'Honda', 'Mitsubishi', 'Toyota', 'Isuzu', 'Other'];
export const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Hybrid', 'Other'];
export const categories = [
  { name: 'Car Silencers', detail: 'A quieter drive begins with the right silencer.', short: 'Quiet, by design.' },
  { name: 'Car Mufflers', detail: 'Purposeful sound control for your car’s exhaust.', short: 'Sound. Refined.' },
  { name: 'Exhaust Pipes', detail: 'Model-specific pipes for an efficient exhaust path.', short: 'Let it flow.' },
  { name: 'Tail Pipes', detail: 'The finishing component of your car’s exhaust.', short: 'The final detail.' },
  { name: 'Rear Silencer Assemblies', detail: 'Rear assemblies made around the fit of your car.' },
  { name: 'Front Exhaust Pipes', detail: 'Front exhaust components for your car’s requirements.' },
  { name: 'Model-Specific Silencers', detail: 'A silencer requirement, matched to your car model.' },
  { name: 'Custom Car Silencers', detail: 'Discuss a specific requirement with our team.' },
];
export const company = {
  name: 'RECO – Ratna Engineering Corporation',
  address: 'East Kallai Cross Road, Chalappuram, Calicut – 673002',
  phone: '0495 2303961', mobile: '9544922507', secondMobile: '7025023317',
  email: 'inforecocalicut@gmail.com', established: 1988,
  logo: null, heroImage: null,
  // Hours were not supplied. Do not infer them from appointment windows.
  businessHours: null,
};
export const visibleProducts = products.filter(p => p.verified && p.image);

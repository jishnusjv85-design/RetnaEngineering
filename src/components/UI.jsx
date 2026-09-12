import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight, FiPhone, FiArrowRight, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { company } from '../data/catalog';
import { whatsappUrl } from '../lib/shared';

export function Logo({ light = false }) { return <span className={`logo ${light ? 'logo-light' : ''}`}>{company.logo ? <img src={company.logo} alt="RECO – Ratna Engineering Corporation" width="180" height="55"/> : <><span className="wordmark">RECO</span><span className="logo-caption">RATNA ENGINEERING CORPORATION</span></>}</span>; }
export function Button({ to, href, children, variant = 'primary', className = '', ...props }) { const cls = `button button-${variant} ${className}`; return to ? <Link to={to} className={cls} {...props}>{children}</Link> : href ? <a href={href} className={cls} {...props}>{children}</a> : <button className={cls} {...props}>{children}</button>; }
export function WhatsApp({ text = 'Hello RECO, I would like to enquire about a car silencer.', children = 'WhatsApp Enquiry', variant = 'outline', ...props }) { return <Button href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer" variant={variant} {...props}><FaWhatsapp/>{children}</Button>; }
export function Reveal({ children, className = '', delay = 0, direction = 'up', distance = 34 }) {
  const reduced = useReducedMotion();
  const axis = direction === 'left' ? { x: distance } : direction === 'right' ? { x: -distance } : { y: distance };
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, ...axis, scale: .985, filter: 'blur(7px)' }} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: .78, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
export function Eyebrow({ children, light = false }) { return <p className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span/>{children}</p>; }
export function SectionHeading({ eyebrow, title, children, link, to }) { return <div className="section-heading"><div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{children && <p>{children}</p>}</div>{link && <Link className="text-link" to={to}>{link}<FiArrowUpRight/></Link>}</div>; }
export function PageIntro({ eyebrow, title, children }) { return <section className="page-intro"><div className="container"><div className="breadcrumb"><Link to="/">Home</Link><span>/</span>{eyebrow}</div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{children}</p></div></section>; }
export function BookingCTA() { return <section className="container"><Reveal className="booking-cta"><div><Eyebrow light>LET’S FIND YOUR FIT</Eyebrow><h2>A quieter drive.<br/>Starts with a conversation.</h2><p>Tell us about your car. We’ll help with the right silencer requirement.</p></div><div className="cta-actions"><Button to="/book-a-slot" variant="light">Book a Slot<FiArrowUpRight/></Button><a href="tel:+914952303961"><FiPhone/>0495 2303961</a></div></Reveal></section>; }
export function Field({ label, name, error, children, className = '', optional = false, ...props }) { return <div className={`field ${className}`}><label htmlFor={name}>{label}{optional && <span> (optional)</span>}</label>{children || <input id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props}/>} {error && <span className="field-error" id={`${name}-error`}>{error}</span>}</div>; }
export function SelectField({ label, name, options, error, placeholder = 'Select an option', ...props }) { return <Field label={label} name={name} error={error}><select id={name} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} {...props}><option value="">{placeholder}</option>{options.map(o => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}</select></Field>; }
export function ErrorNotice({ children }) { return children ? <div role="alert" className="notice notice-error">{children}</div> : null; }
export function SuccessNotice({ children }) { return <div role="status" className="notice notice-success"><FiCheck/>{children}</div>; }
export function EmptyCatalogue({ model = false }) { return <div className="empty-catalogue"><span className="empty-index">RECO / YOUR CAR</span><h3>{model ? 'Cannot find your car model?' : 'The right part starts with your car.'}</h3><p>{model ? 'Cannot find your car model? Contact RECO for a model-specific silencer solution.' : 'Share your manufacturer, model and fuel type. Our team will confirm the right product, availability and price for your car.'}</p><div className="button-row"><WhatsApp text="Hello RECO, please help me find a silencer for my car."/><Button to="/book-a-slot" variant="subtle">Book an Inspection<FiArrowRight/></Button></div></div>; }
export function Turnstile({ onToken, resetKey = 0 }) {
  const ref = useRef(null); const callback = useRef(onToken); callback.current = onToken;
  useEffect(() => {
    const key = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!key) return;
    let cancelled = false, widget;
    const render = () => { if (!cancelled && window.turnstile && ref.current) widget = window.turnstile.render(ref.current, { sitekey: key, callback: t => callback.current(t), 'expired-callback': () => callback.current(''), 'error-callback': () => callback.current('') }); };
    let script = document.querySelector('script[data-turnstile]');
    if (window.turnstile) render(); else { if (!script) { script = document.createElement('script'); script.dataset.turnstile = 'true'; script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; document.head.appendChild(script); } script.addEventListener('load', render); }
    return () => { cancelled = true; script?.removeEventListener('load', render); if (widget !== undefined) window.turnstile?.remove(widget); };
  }, [resetKey]);
  return <div ref={ref}/>;
}

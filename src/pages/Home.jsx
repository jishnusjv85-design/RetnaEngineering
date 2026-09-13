import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiArrowRight, FiCheckCircle, FiTarget, FiVolumeX, FiLayers, FiMapPin, FiPhone } from 'react-icons/fi';
import { Button, Reveal, Eyebrow, SectionHeading, BookingCTA, EmptyCatalogue } from '../components/UI';
import { categories, company, supportedCars, visibleProducts } from '../data/catalog';
import { ProductCard } from './Products';
import { EnquiryForm } from './Contact';

const media = {
  workshop: 'https://images.pexels.com/photos/4116231/pexels-photo-4116231.jpeg?auto=compress&cs=tinysrgb&w=1600',
  engineering: 'https://images.pexels.com/photos/4116202/pexels-photo-4116202.jpeg?auto=compress&cs=tinysrgb&w=1400',
  parts: 'https://images.pexels.com/photos/28641472/pexels-photo-28641472.jpeg?auto=compress&cs=tinysrgb&w=1400',
  precision: 'https://images.pexels.com/photos/7568414/pexels-photo-7568414.jpeg?auto=compress&cs=tinysrgb&w=1400'
};

const componentSlugs = ['car-silencers', 'car-mufflers', 'exhaust-pipes', 'tail-pipes'];

export const qualities = [
  [FiTarget, 'Accurate fitment', 'We make car-specific exhaust parts with close attention to the dimensions that affect fitment.'],
  [FiLayers, 'Built for daily use', 'We use suitable materials and careful workmanship to make dependable exhaust components.'],
  [FiVolumeX, 'Reduced exhaust noise', 'Our silencers are designed to control exhaust noise while maintaining proper exhaust flow.'],
];

export default function Home() { return <>
  <section className="hero hero-media-led">
    <div className="hero-media-bg" style={{backgroundImage:`linear-gradient(90deg,rgba(7,25,36,.98) 0%,rgba(7,25,36,.90) 38%,rgba(7,25,36,.25) 70%,rgba(7,25,36,.12) 100%),url(${media.workshop})`}}/>
    <div className="container hero-grid hero-grid-media">
      <Reveal className="hero-copy" direction="right"><Eyebrow light>CAR SILENCER SPECIALISTS · SINCE 1988</Eyebrow><h1>Car silencers and<br/><em>exhaust parts made to fit.</em></h1><p>RECO manufactures car silencers and exhaust components in Calicut, with a focus on proper fitment, dependable quality and comfortable everyday driving.</p><div className="button-row"><Button to="/car-silencers" variant="teal">Explore Car Silencers<FiArrowUpRight/></Button><Button to="/book-a-slot" variant="ghost">Book a Slot<FiArrowRight/></Button></div><a className="hero-whatsapp" href="https://wa.me/919544922507?text=Hello%20RECO%2C%20I%20have%20a%20car-silencer%20enquiry." target="_blank" rel="noreferrer">WhatsApp Enquiry<FiArrowUpRight/></a></Reveal>
      <Reveal className="hero-side-card" direction="left" delay={.12}><span>RECO / SINCE 1988</span><strong>Made for your car.<br/><em>Built for everyday use.</em></strong><p>Model-specific car exhaust manufacturing from Calicut.</p></Reveal>
    </div>
    <div className="hero-lower container"><span><FiCheckCircle/>Passenger-car specialists</span><span><FiCheckCircle/>Model-specific manufacturing</span><span><FiMapPin/>Made in Calicut</span><a href="tel:+914952303961">Call Now <FiArrowUpRight/></a></div>
  </section>

  <section className="section container visual-intro"><Reveal><SectionHeading eyebrow="WHY CUSTOMERS CHOOSE RECO" title="Practical experience. Careful workmanship.">We focus on correct fitment, durable materials and reliable exhaust performance for everyday driving.</SectionHeading></Reveal><div className="quality-grid">{qualities.map(([Icon, title, text], i) => <Reveal key={title} className="quality" delay={i * .08}><span className="quality-icon"><Icon/></span><h3>{title}</h3><p>{text}</p><span className="quality-index">0{i + 1}</span></Reveal>)}</div></section>

  <section className="media-story-band">
    <div className="container media-story-grid">
      <Reveal className="media-story-copy" direction="right"><Eyebrow light>HOW WE WORK</Eyebrow><h2>Good fitment starts with the right details.</h2><p>We consider the vehicle model, dimensions, material choice, exhaust flow and road-use comfort before recommending or manufacturing a part.</p><Button to="/about" variant="light">About RECO<FiArrowUpRight/></Button></Reveal>
      <Reveal className="media-story-image media-story-image-main" direction="left"><img src={media.engineering} alt="Automotive engineering workshop imagery" loading="lazy"/></Reveal>
      <Reveal className="media-story-image media-story-image-small" delay={.1}><img src={media.parts} alt="Automotive tools and component workshop imagery" loading="lazy"/></Reveal>
    </div>
  </section>

  <section className="section container"><Reveal><SectionHeading eyebrow="OUR PRODUCT RANGE" title="Find the exhaust part for your car." link="Explore all products" to="/car-silencers">Browse RECO car silencers, mufflers, pipes and related exhaust components.</SectionHeading></Reveal><div className="category-grid">{categories.slice(0, 4).map((c, i) => <Reveal key={c.name} delay={i * .06}><Link to={`/exhaust-components/${componentSlugs[i]}`} target="_blank" rel="noopener noreferrer" className={`category-card category-${i}`} aria-label={`Open detailed information about ${c.name} in a new tab`}><div className="category-top"><span>0{i + 1} / EXHAUST COMPONENTS</span><FiArrowUpRight/></div><div className="category-statement">{c.short}</div><div><h3>{c.name}</h3><p>{c.detail}</p><span className="category-learn-more">View details <FiArrowUpRight/></span></div></Link></Reveal>)}</div></section>

  <section className="vehicle-band"><div className="vehicle-band-bg" style={{backgroundImage:`linear-gradient(90deg,rgba(8,34,48,.98),rgba(8,34,48,.76),rgba(8,34,48,.25)),url(${media.precision})`}}/><div className="container vehicle-band-content"><Reveal><Eyebrow light>FIND THE RIGHT FIT</Eyebrow><h2>Tell us what car you drive.</h2><p>Share the manufacturer, model, year and fuel type. Our team will help identify the suitable silencer or exhaust component.</p><Button to="/car-models" variant="teal">Find My Car<FiArrowRight/></Button></Reveal><div className="vehicle-band-stat"><strong>1988</strong><span>ESTABLISHED<br/>IN CALICUT</span></div></div></section>

  <section className="brand-strip"><div className="container"><div><Eyebrow>CAR BRANDS & MODELS</Eyebrow><h2>Search by your car model.</h2></div><p>If your model is not listed, contact us.<br/>We also review custom requirements.</p><Button to="/car-models" variant="outline">Find My Car<FiArrowRight/></Button>{supportedCars.length > 0 && <div className="brand-list">{supportedCars.map(b => <span key={b.manufacturer}>{b.manufacturer}</span>)}</div>}</div></section>

  <section className="heritage-section heritage-visual"><div className="container heritage-grid"><Reveal className="heritage-year"><Eyebrow>ROOTED IN CALICUT</Eyebrow><strong>Since<br/><span>1988.</span></strong><p>Serving car owners for decades.</p></Reveal><Reveal className="heritage-copy"><Eyebrow>OUR STORY</Eyebrow><h2>Car silencer manufacturing since 1988.</h2><p>Ratna Engineering Corporation has been manufacturing car silencers and exhaust components in Calicut since 1988.</p><p>Our work is based on practical experience, careful manufacturing and attention to model-specific fitment.</p><Link to="/about" className="text-link">About RECO<FiArrowUpRight/></Link></Reveal></div></section>

  <section className="section container"><SectionHeading eyebrow="FEATURED CAR SILENCERS" title="Browse available car silencers." link="View the catalogue" to="/car-silencers"/>{visibleProducts.length ? <div className="product-grid">{visibleProducts.slice(0, 3).map(p => <ProductCard key={p.id} product={p}/>)}</div> : <EmptyCatalogue/>}</section>

  <section className="container custom-feature visual-custom"><div className="custom-feature-image"><img src={media.parts} alt="Automotive workshop tools and fabrication imagery" loading="lazy"/></div><div><Eyebrow>MODEL-SPECIFIC REQUIREMENTS</Eyebrow><h2>Need a silencer for a specific car?</h2><p>Send us your car details and, if possible, a photograph of the existing part. We will review the fitment, availability and price.</p><Button to="/custom-silencers">Custom Silencer Manufacturing<FiArrowUpRight/></Button></div></section>

  <BookingCTA/>
  <section className="section container enquiry-grid"><div><Eyebrow>CONTACT RECO</Eyebrow><h2>Need help with a<br/>car silencer?</h2><p>Call, WhatsApp or send us an enquiry with your car details.</p><a className="contact-inline" href="tel:+914952303961"><FiPhone/><span><small>CALL RECO</small>0495 2303961</span></a><div className="contact-inline"><FiMapPin/><span><small>VISIT US IN CALICUT</small>{company.address}</span></div></div><EnquiryForm/></section>
  </>; }

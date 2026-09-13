import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowUpRight, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { Button, Eyebrow, BookingCTA } from '../components/UI';

const componentDetails = {
  'car-silencers': {
    index: '01',
    name: 'Car Silencers',
    headline: 'Quiet, by design.',
    intro: 'The silencer is a key part of your car’s exhaust system. It reduces exhaust noise while allowing gases to leave the engine through a correctly routed exhaust path.',
    hero: '/images/reco/RECO_Hero_02_Product_Studio.webp',
    secondary: '/images/reco/RECO_Detail_01_Welding.webp',
    imageAlt: 'RECO car silencer product and fabrication detail',
    points: [
      'Controls exhaust noise for more comfortable everyday driving.',
      'Must match the vehicle model, mounting points, pipe diameter and body clearance.',
      'A damaged or internally failed silencer can cause excess noise, vibration or rattling.',
      'RECO reviews the car model and existing exhaust layout before confirming the suitable part.'
    ],
    signs: ['Exhaust becomes noticeably louder', 'Rattling from the rear or middle of the car', 'Visible rust, cracks or holes', 'Exhaust vibration or poor fitment under the vehicle'],
    fitment: 'Correct silencer fitment is model-specific. Vehicle year, engine/fuel type, flange position, hanger points and overall length can affect compatibility.'
  },
  'car-mufflers': {
    index: '02',
    name: 'Car Mufflers',
    headline: 'Sound. Refined.',
    intro: 'A muffler manages the sound pulses created by exhaust gases. Its internal chambers and passages are designed to reduce harsh exhaust sound while maintaining a practical flow path.',
    hero: '/images/reco/RECO_Detail_02_Muffler_Closeup.webp',
    secondary: '/images/reco/RECO_Product_Range.webp',
    imageAlt: 'Close-up view of a RECO muffler and exhaust range',
    points: [
      'Reduces unwanted exhaust sound and resonance.',
      'Works as part of the complete exhaust system rather than as an isolated component.',
      'Internal damage may create rattling even when the outer shell looks acceptable.',
      'Replacement should consider the original dimensions, inlet/outlet location and mounting arrangement.'
    ],
    signs: ['Booming or droning exhaust sound', 'Metallic rattle inside the muffler body', 'Leaking seams or perforation', 'Loose or damaged mounting points'],
    fitment: 'A muffler must align with the existing pipe route and vehicle body. RECO can check dimensions and vehicle details before manufacturing or recommending a replacement.'
  },
  'exhaust-pipes': {
    index: '03',
    name: 'Exhaust Pipes',
    headline: 'Let it flow.',
    intro: 'Exhaust pipes connect the major sections of the exhaust system and carry gases safely toward the rear of the vehicle. Their bends, diameter and connection points need to follow the vehicle layout accurately.',
    hero: '/images/reco/RECO_Detail_03_Pipe_Manufacturing.webp',
    secondary: '/images/reco/RECO_Detail_01_Welding.webp',
    imageAlt: 'RECO exhaust pipe manufacturing and welding detail',
    points: [
      'Routes exhaust gases through the intended path under the vehicle.',
      'Correct bends help maintain clearance from the body, suspension and other components.',
      'Connection points and pipe diameter need to match the adjoining exhaust components.',
      'Fabrication quality matters at bends, joints and welded sections.'
    ],
    signs: ['Hissing or blowing sound under the car', 'Visible pipe corrosion or cracking', 'Pipe touching the body and causing vibration', 'Broken joint, flange or hanger area'],
    fitment: 'Exhaust pipes are highly dependent on the exact model and underbody layout. A sample pipe, measurements or clear photographs can help confirm the correct fabrication.'
  },
  'tail-pipes': {
    index: '04',
    name: 'Tail Pipes',
    headline: 'The final detail.',
    intro: 'The tail pipe is the final exhaust section, guiding gases out behind the vehicle. Correct length, angle and position help keep the exhaust outlet clear of the bumper and vehicle body.',
    hero: '/images/reco/RECO_Product_Range.webp',
    secondary: '/images/reco/RECO_Hero_01_Exhaust_Vehicle.webp',
    imageAlt: 'RECO exhaust component range and vehicle exhaust detail',
    points: [
      'Completes the exhaust route and directs gases away from the vehicle.',
      'Needs the correct outlet position and clearance from the bumper.',
      'Should align cleanly with the rear silencer or connecting pipe.',
      'Can be manufactured to suit model-specific dimensions and routing.'
    ],
    signs: ['Tail pipe is loose or misaligned', 'Outlet is too close to the bumper', 'Corrosion or holes near the end section', 'Noise or vibration from a damaged rear connection'],
    fitment: 'Tail-pipe shape and position vary between models. RECO checks the rear exhaust arrangement so the final section sits correctly and safely.'
  }
};

export default function ExhaustComponentDetail() {
  const { slug } = useParams();
  const item = componentDetails[slug];

  useEffect(() => {
    if (item) document.title = `${item.name} | RECO – Ratna Engineering Corporation`;
    window.scrollTo(0, 0);
  }, [item]);

  if (!item) return <section className="section container not-found"><span>PRODUCT INFORMATION</span><h1>Component not found.</h1><p>Please return to the RECO product range.</p><Button to="/">Return Home</Button></section>;

  return <>
    <section className="component-detail-hero">
      <div className="container component-detail-hero-grid">
        <div className="component-detail-copy">
          <Link to="/" className="detail-back"><FiArrowLeft/> Back to product range</Link>
          <Eyebrow>{item.index} / EXHAUST COMPONENTS</Eyebrow>
          <h1>{item.name}</h1>
          <div className="component-detail-statement">{item.headline}</div>
          <p>{item.intro}</p>
          <div className="button-row"><Button to={`/car-silencers?category=${encodeURIComponent(item.name)}`} variant="teal">View Catalogue<FiArrowUpRight/></Button><Button to="/book-a-slot" variant="outline">Book Inspection</Button></div>
        </div>
        <div className="component-detail-hero-image"><img src={item.hero} alt={item.imageAlt}/></div>
      </div>
    </section>

    <section className="section container component-explainer-grid">
      <div className="component-explainer-main">
        <Eyebrow>WHAT IT DOES</Eyebrow>
        <h2>What you should know about {item.name.toLowerCase()}.</h2>
        <div className="component-points">{item.points.map(point => <div key={point}><FiCheckCircle/><p>{point}</p></div>)}</div>
      </div>
      <div className="component-explainer-image"><img src={item.secondary} alt={`${item.name} manufacturing and fitment detail`}/></div>
    </section>

    <section className="component-info-band">
      <div className="container component-info-grid">
        <div><Eyebrow light>WHEN TO HAVE IT CHECKED</Eyebrow><h2>Common signs of a problem.</h2><ul>{item.signs.map(sign => <li key={sign}>{sign}</li>)}</ul></div>
        <div className="component-fitment-card"><span>MODEL-SPECIFIC FITMENT</span><h3>The correct part depends on your car.</h3><p>{item.fitment}</p><p>Send the manufacturer, model, year and fuel type. A photo of the existing part is also useful when available.</p><a href="https://wa.me/919544922507?text=Hello%20RECO%2C%20I%20need%20help%20identifying%20the%20correct%20exhaust%20part%20for%20my%20car." target="_blank" rel="noreferrer">Ask RECO on WhatsApp <FiArrowUpRight/></a></div>
      </div>
    </section>

    <section className="section container component-help"><div><Eyebrow>NEED HELP?</Eyebrow><h2>Not sure which exhaust component you need?</h2><p>Bring the vehicle to RECO or send us the car details and photos. We can help identify the required section and check fitment.</p></div><a className="contact-inline" href="tel:+914952303961"><FiPhone/><span><small>CALL RECO</small>0495 2303961</span></a></section>
    <BookingCTA/>
  </>;
}

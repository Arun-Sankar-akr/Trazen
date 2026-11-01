import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowUpRight, Check, ChevronRight, Menu, X, Plus,
  Code2, Smartphone, MessageCircle, Globe2, Layers3, ShieldCheck, Zap, Gauge,
} from 'lucide-react';
import { BUSINESS, whatsappLink } from './config';
import CoachingDemo from './demos/CoachingDemo';
import RestaurantDemo from './demos/RestaurantDemo';
import BusinessDemo from './demos/BusinessDemo';
import logo from "../public/logo.png"

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const liveProjects = [
  { no: '01', type: 'Travel & Tourism', title: 'SST Travel', desc: 'A live travel website created to present travel services and help visitors explore the offering.', url: 'https://ssttravel.netlify.app/', tag: 'Live website', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85' },
  { no: '02', type: 'Education', title: 'HCMHSS School', desc: 'A live school website and digital experience for an educational institution.', url: 'https://hcmhss.vercel.app/', tag: 'Live website', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85' },
  { no: '03', type: 'Retail & Operations', title: 'AKR Shop Management', desc: 'A live shop-management and billing project built for day-to-day business operations.', url: 'https://akr-try-xerox.vercel.app/', tag: 'Live application', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=85' },
];

const concepts = [
  { no: '01', title: 'Coaching centre', desc: 'An admissions-focused website concept for tuition and coaching businesses.', path: '/demo/coaching', tone: 'silver', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80' },
  { no: '02', title: 'Restaurant', desc: 'A menu-led concept with location details and WhatsApp table enquiries.', path: '/demo/restaurant', tone: 'blue', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80' },
  { no: '03', title: 'Local business', desc: 'A minimal business profile concept for independent service providers.', path: '/demo/business', tone: 'red', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80' },
];

const highlights = [
  { icon: Smartphone, title: 'Responsive by design', text: 'Every screen, considered.' },
  { icon: Gauge, title: 'Clean, lightweight builds', text: 'Simple pages that load fast.' },
  { icon: MessageCircle, title: 'Direct enquiries', text: 'Customers reach you on WhatsApp.' },
  { icon: ShieldCheck, title: 'Scope in writing', text: 'No hidden extras, ever.' },
];

const steps = [
  { no: '01', title: 'Understand the brief', text: 'Share your business, goals, required pages and references you like.' },
  { no: '02', title: 'Agree the scope', text: 'We confirm price, timeline, deliverables and revision limit before work starts.' },
  { no: '03', title: 'Review the preview', text: 'See the website, share feedback and check it on mobile and desktop.' },
  { no: '04', title: 'Launch with confidence', text: 'After final payment, receive the agreed files and handover details.' },
];

const plans = [
  {
    tier: 'Essential', no: '01', name: 'One-page website', price: '₹1,999',
    blurb: 'For a clear business introduction and enquiry page.',
    items: ['Single scrolling page', 'Mobile-friendly layout', 'WhatsApp contact link', 'One revision round'],
    cta: 'Ask about Essential', msg: 'I am interested in the one-page website package starting at ₹1,999.',
  },
  {
    tier: 'Growth', no: '02', name: 'Business website', price: '₹3,999', featured: true,
    blurb: 'For businesses that need a few focused pages.',
    items: ['Up to 5 agreed pages', 'Mobile-friendly layout', 'Contact / enquiry links', 'Two revision rounds'],
    cta: 'Ask about Growth', msg: 'I am interested in the business website package starting at ₹3,999.',
  },
];

const faqs = [
  { q: 'Do I need to pay for a domain or hosting?', a: 'A domain and hosting may have third-party costs. They are not included in the starter prices. We can help you choose a suitable provider, and the account should ideally be owned by you.' },
  { q: 'How long does a website take?', a: 'A simple one-page site may take a few working days after content and requirements are confirmed. Larger projects take longer. The agreed timeline will be written in your project scope.' },
  { q: 'Can you update my existing website?', a: 'Yes. Share the current website and a list of changes. Small fixes can be quoted separately after review.' },
  { q: 'How do payments work?', a: 'For small custom projects, a typical arrangement is 50% advance and 50% before final handover. The exact milestones will be agreed in writing.' },
];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

/** Fades + lifts an element in the first time it scrolls into view. */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { setShown(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`ax-reveal${shown ? ' is-in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>{children}</Tag>;
}

function Eyebrow({ children, light }) {
  return <span className={`ax-eyebrow${light ? ' ax-eyebrow-light' : ''}`}><i />{children}</span>;
}

function Brand({ onClick }) {
  return (
    <Link to="/" className="ax-brand" onClick={onClick} aria-label="Trazen Studio home">
      <img src={logo} alt="Trazen" id='logo' />
      {/* <span className="ax-brand-mark"><b>M</b><i /></span>
      <span className="ax-brand-name">Trazen<small>Independent digital studio</small></span> */}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  const close = () => setOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`ax-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="ax-wrap ax-header-bar">
        <Brand onClick={close} />
        <button className="ax-menu-btn" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="ax-nav">
          {open ? <X /> : <Menu />}
        </button>
        <nav id="ax-nav" className={`ax-nav${open ? ' is-open' : ''}`}>
          <a href="/#services" onClick={close}>Services</a>
          <a href="/#work" onClick={close}>Selected work</a>
          <a href="/#process" onClick={close}>How it works</a>
          <a href="/#pricing" onClick={close}>Pricing</a>
          {isDemo && <Link to="/" onClick={close}>Back to studio</Link>}
          <a className="ax-pill ax-pill-dark ax-nav-cta" href={whatsappLink('Hi, I would like a website quote.')} target="_blank" rel="noreferrer" onClick={close}>
            Start a project <ArrowUpRight size={15} />
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Home sections                                                      */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="ax-hero" id="top">
      <div className="ax-wrap ax-hero-head">
        <Reveal><Eyebrow>Independent web design &amp; development</Eyebrow></Reveal>
        <Reveal as="h1" delay={80}>Make your business <span className="ax-grad">stand out.</span></Reveal>
        <Reveal as="p" delay={160} className="ax-lead">
          Digital experiences with clarity, character and purpose. We build modern websites that help local businesses look credible and get discovered.
        </Reveal>
        <Reveal delay={240} className="ax-hero-actions">
          <a className="ax-pill ax-pill-blue ax-pill-lg" href={whatsappLink('Hi! I would like to discuss a website for my business.')} target="_blank" rel="noreferrer">
            Build with us <ArrowUpRight size={18} />
          </a>
          <a className="ax-textlink" href="#work">Explore our work <ChevronRight size={18} /></a>
        </Reveal>
        <Reveal as="p" delay={300} className="ax-hero-note"><span className="ax-live" /> Available for select projects · Based in India, working everywhere</Reveal>
      </div>

      <div className="ax-wrap">
        <Reveal delay={120} className="ax-stage" aria-label="Website design preview">
          <div className="ax-stage-ring ax-ring-a" /><div className="ax-stage-ring ax-ring-b" />

          <div className="ax-laptop">
            <div className="ax-screen">
              <div className="ax-screen-bar">
                <span className="ax-lights"><i /><i /><i /></span>
                <span className="ax-url">yourbusiness.in</span>
              </div>
              <div className="ax-site">
                <div className="ax-site-nav"><b>YOUR BRAND<sup>®</sup></b><span>About</span><span>Services</span><span>Contact</span></div>
                <div className="ax-site-hero">
                  <small>Built for what’s next</small>
                  <strong>Ideas into <em>impact.</em></strong>
                  <span className="ax-site-btn">Explore the experience <ArrowUpRight size={12} /></span>
                </div>
                <div className="ax-site-cards"><i /><i /><i /></div>
              </div>
            </div>
            <div className="ax-base" />
          </div>

          <div className="ax-phone" aria-hidden="true">
            <div className="ax-phone-notch" />
            <div className="ax-phone-body">
              <small>YOUR BRAND</small>
              <strong>Hello,<br />customers.</strong>
              <span className="ax-phone-btn">Chat on WhatsApp</span>
              <div className="ax-phone-rows"><i /><i /><i /></div>
            </div>
          </div>

          <div className="ax-chip ax-chip-a">
            <span className="ax-chip-icon"><Smartphone size={18} /></span>
            <span><b>Responsive by design</b><small>Every screen, considered.</small></span>
          </div>
          <div className="ax-chip ax-chip-b">
            <span className="ax-chip-icon ax-chip-icon-red"><Zap size={18} /></span>
            <span><b>Built to connect</b><small>Clear paths to enquiry.</small></span>
          </div>
        </Reveal>
      </div>

      <div className="ax-wrap">
        <ul className="ax-highlights">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <Reveal as="li" delay={i * 70} key={h.title}>
                <span className="ax-hl-icon"><Icon size={20} /></span>
                <span><b>{h.title}</b><small>{h.text}</small></span>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="ax-statement" id="approach">
      <div className="ax-wrap">
        <Reveal><Eyebrow>The studio</Eyebrow></Reveal>
        <Reveal as="h2" delay={80}>Your next customer is already <span>online.</span></Reveal>
        <Reveal as="p" delay={160}>
          We turn your business story into a clear, polished digital experience — designed to build trust, explain what you offer and make the next step effortless.
        </Reveal>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="ax-section ax-services" id="services">
      <div className="ax-wrap">
        <Reveal className="ax-head">
          <Eyebrow>What we do</Eyebrow>
          <h2>Digital, made <span className="ax-grad">distinctive.</span></h2>
          <p>Focused services for businesses that want a stronger online presence without unnecessary complexity.</p>
        </Reveal>

        <div className="ax-bento">
          <Reveal className="ax-tile ax-tile-dark ax-tile-lg">
            <div className="ax-tile-top"><span className="ax-tile-tag">Core service</span><Globe2 size={24} /></div>
            <div className="ax-tile-copy">
              <h3>Websites that work for you.</h3>
              <p>Professional, responsive websites that introduce your business, showcase your services and turn interest into enquiries.</p>
              <a className="ax-textlink ax-textlink-light" href="#contact">Explore business websites <ChevronRight size={18} /></a>
            </div>
            <div className="ax-tile-art" aria-hidden="true">
              <div className="ax-mini-browser">
                <div className="ax-mini-dots"><i /><i /><i /></div>
                <b>YOUR<br />DIGITAL<br /><em>SPACE.</em></b>
                <div className="ax-mini-lines"><i /><i /></div>
              </div>
              <div className="ax-mini-phone"><i /><i /><b /></div>
            </div>
          </Reveal>

          <Reveal delay={90} className="ax-tile ax-tile-silver">
            <span className="ax-tile-icon"><Layers3 size={22} /></span>
            <h3>Redesign &amp; refresh</h3>
            <p>Give your existing website a sharper layout, stronger visual identity and better mobile experience.</p>
            <ul className="ax-chips"><li>Visual refresh</li><li>Mobile improvements</li><li>Navigation clean-up</li></ul>
          </Reveal>

          <Reveal delay={180} className="ax-tile ax-tile-blue">
            <span className="ax-tile-icon ax-tile-icon-blue"><Code2 size={22} /></span>
            <h3>Fixes &amp; support</h3>
            <p>Practical front-end help for responsive issues, React/CSS bugs and small website updates.</p>
            <ul className="ax-chips"><li>React / CSS fixes</li><li>Responsive bug fixes</li><li>Content updates</li></ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="ax-section" id="work">
      <div className="ax-wrap">
        <Reveal className="ax-head">
          <Eyebrow>Selected work</Eyebrow>
          <h2>Made real. <span className="ax-grad">Out in the world.</span></h2>
          <p>Live projects across travel, education and retail operations. Take a closer look at the work itself.</p>
        </Reveal>

        <div className="ax-work-grid">
          {liveProjects.map((p, i) => (
            <Reveal as="a" delay={i * 90} href={p.url} target="_blank" rel="noreferrer" className={`ax-work-card ax-work-${i + 1}`} key={p.no} aria-label={`${p.title} — open live project`}>
              <img src={p.image} alt={`${p.title} project category preview`} loading="lazy" />
              <span className="ax-work-shade" />
              <span className="ax-work-chip">{p.tag}</span>
              <span className="ax-work-open"><ArrowUpRight size={20} /></span>
              <div className="ax-work-copy">
                <small>{p.no} · {p.type}</small>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <b>View live project <ChevronRight size={16} /></b>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Concepts() {
  return (
    <section className="ax-section ax-concepts" id="concepts">
      <div className="ax-wrap">
        <Reveal className="ax-head">
          <Eyebrow>Design explorations</Eyebrow>
          <h2>Find your <span className="ax-grad">direction.</span></h2>
          <p>Three illustrative website concepts to help you picture what a digital home for your business could look like. These are demos, separate from the live projects.</p>
        </Reveal>

        <div className="ax-concept-grid">
          {concepts.map((c, i) => (
            <Reveal delay={i * 90} key={c.no} className="ax-concept-wrap">
              <Link to={c.path} className={`ax-concept ax-concept-${c.tone}`}>
                <span className="ax-concept-tag">Concept / {c.no}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="ax-concept-img"><img src={c.image} alt={`${c.title} concept preview`} loading="lazy" /></div>
                <span className="ax-concept-go">Explore concept <ArrowUpRight size={18} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="ax-section ax-process" id="process">
      <div className="ax-wrap">
        <div className="ax-process-head">
          <Reveal>
            <Eyebrow light>The method</Eyebrow>
            <h2>Good work. <span className="ax-grad ax-grad-light">No guesswork.</span></h2>
          </Reveal>
          <Reveal delay={100}>
            <p>No confusing jargon or surprise extras. You know what we’re building, what it costs and what happens next.</p>
            <a className="ax-textlink ax-textlink-light" href={whatsappLink('Hi, can you explain your website process?')} target="_blank" rel="noreferrer">Talk through your project <ChevronRight size={18} /></a>
          </Reveal>
        </div>

        <ol className="ax-steps">
          {steps.map((s, i) => (
            <Reveal as="li" delay={i * 90} key={s.no}>
              <span className="ax-step-no">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <span className="ax-step-check"><Check size={16} /></span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="ax-section" id="pricing">
      <div className="ax-wrap">
        <Reveal className="ax-head">
          <Eyebrow>Starting points</Eyebrow>
          <h2>Clear prices. <span className="ax-grad">Clear priorities.</span></h2>
          <p>Every project is confirmed with a written scope before work begins. Domain, hosting, paid plugins and third-party subscriptions are not included unless specifically agreed.</p>
        </Reveal>

        <div className="ax-plans">
          {plans.map((p, i) => (
            <Reveal delay={i * 100} key={p.no} className={`ax-plan${p.featured ? ' ax-plan-featured' : ''}`}>
              <div className="ax-plan-top"><span>{p.tier}</span>{p.featured && <em>Most popular</em>}</div>
              <h3>{p.name}</h3>
              <div className="ax-price">{p.price}<small> / starting</small></div>
              <p>{p.blurb}</p>
              <ul>{p.items.map((it) => <li key={it}><Check size={16} /> {it}</li>)}</ul>
              <a className={`ax-pill ax-pill-lg ${p.featured ? 'ax-pill-blue' : 'ax-pill-dark'}`} href={whatsappLink(p.msg)} target="_blank" rel="noreferrer">
                {p.cta} <ArrowUpRight size={16} />
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="ax-price-note"><ShieldCheck size={22} /><span><b>No hidden extras.</b> Scope agreed before we begin.</span></Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="ax-section ax-faq" id="faq">
      <div className="ax-wrap ax-faq-layout">
        <Reveal className="ax-faq-intro">
          <Eyebrow>Good to know</Eyebrow>
          <h2>Questions, <span className="ax-grad">answered.</span></h2>
          <p>Not sure where to start? Here are a few helpful details before we talk.</p>
        </Reveal>
        <div className="ax-faq-list">
          {faqs.map((f, i) => (
            <Reveal as="details" delay={i * 70} key={f.q}>
              <summary>{f.q}<span className="ax-faq-plus"><Plus size={18} /></span></summary>
              <p>{f.a}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ form, update, submit }) {
  return (
    <section className="ax-contact" id="contact">
      <div className="ax-wrap">
        <Reveal className="ax-contact-panel">
          <div className="ax-contact-copy">
            <Eyebrow light>Start a conversation</Eyebrow>
            <h2>Let’s make something <span className="ax-grad ax-grad-light">matter.</span></h2>
            <p>Tell us a little about your project. We’ll reply with the next steps and a clear estimate.</p>
            <a className="ax-direct" href={whatsappLink()} target="_blank" rel="noreferrer">
              <span className="ax-direct-icon"><MessageCircle size={22} /></span>
              <span><small>Prefer WhatsApp?</small><b>Message us directly <ArrowUpRight size={15} /></b></span>
            </a>
          </div>

          <form className="ax-form" onSubmit={submit}>
            <div className="ax-form-head"><span>Project enquiry</span><span>Let’s talk ↗</span></div>
            <label>Your name<input name="name" value={form.name} onChange={update} placeholder="e.g. Priya" required /></label>
            <label>Business name<input name="business" value={form.business} onChange={update} placeholder="Your business" required /></label>
            <div className="ax-form-row">
              <label>What do you need?
                <select name="need" value={form.need} onChange={update}>
                  <option>A new business website</option><option>Website redesign</option><option>React / CSS bug fix</option><option>Website maintenance</option><option>Something else</option>
                </select>
              </label>
              <label>Approx. budget
                <select name="budget" value={form.budget} onChange={update}>
                  <option>Under ₹2,000</option><option>₹2,000–₹5,000</option><option>₹5,000–₹10,000</option><option>Need guidance</option>
                </select>
              </label>
            </div>
            <label>Project details<textarea name="message" value={form.message} onChange={update} placeholder="What does your business do? What should the website help you achieve?" rows="3" /></label>
            <button className="ax-pill ax-pill-blue ax-pill-lg ax-form-submit" type="submit">Send enquiry on WhatsApp <ArrowUpRight size={16} /></button>
            <small>This opens WhatsApp with your enquiry filled in. No details are stored on this demo site.</small>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ax-footer">
      <div className="ax-wrap">
        <div className="ax-footer-top">
          <div className="ax-footer-brand">
            <Brand />
            <p>Thoughtful digital experiences for businesses building what’s next.</p>
          </div>
          <div className="ax-footer-cols">
            <div><h4>Studio</h4><a href="/#services">Services</a><a href="/#work">Selected work</a><a href="/#process">How it works</a></div>
            <div><h4>Explore</h4><a href="/#concepts">Concepts</a><a href="/#pricing">Pricing</a><a href="/#faq">FAQ</a></div>
            <div><h4>Contact</h4><a href="/#contact">Send an enquiry</a><a href={whatsappLink()} target="_blank" rel="noreferrer">WhatsApp</a></div>
          </div>
        </div>
        <div className="ax-footer-bottom">
          <span>© {new Date().getFullYear()} {BUSINESS.name}. Independent studio.</span>
          <span>Designed with intention · Made to work</span>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  const [form, setForm] = useState({ name: '', business: '', need: 'A new business website', budget: '₹2,000–₹5,000', message: '' });
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const msg = `Website enquiry from ${form.name}\nBusiness: ${form.business}\nRequirement: ${form.need}\nBudget: ${form.budget}\nDetails: ${form.message}`;
    window.open(whatsappLink(msg), '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="ax-home">
      <main>
        <Hero />
        <Statement />
        <Services />
        <Work />
        <Concepts />
        <Process />
        <Pricing />
        <Faq />
        <Contact form={form} update={update} submit={submit} />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo shell + routes (unchanged behaviour)                          */
/* ------------------------------------------------------------------ */

function DemoShell({ children, label }) {
  return (
    <>
      <div className="demo-banner"><div className="container"><span>CONCEPT DEMO / {label}</span><Link to="/">← Back to Trazen Studio</Link></div></div>
      {children}
    </>
  );
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo/coaching" element={<DemoShell label="EDUCATION"><CoachingDemo /></DemoShell>} />
        <Route path="/demo/restaurant" element={<DemoShell label="HOSPITALITY"><RestaurantDemo /></DemoShell>} />
        <Route path="/demo/business" element={<DemoShell label="LOCAL BUSINESS"><BusinessDemo /></DemoShell>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
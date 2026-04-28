
const React = window.React;
const { useState, useRef } = React;
const {
  motion, useInView,
  ArrowUpRight, Check, Star, ChevronRight,
  BookOpen, Users, Clock, Award, Brain, Cpu, Layers, Server,
  MessageSquare, Globe, Sparkles, Code2, GitBranch, Zap, Lock,
  SectionBadge, SectionHeading, GlassBtn, FooterBar, BlurText,
} = window;

/* ─── shared inner-page hero ─── */
function PageHero({ badge, title, sub }) {
  return (
    <section data-bg-palette="blue-violet" style={{ paddingTop: 160, paddingBottom: 80, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <SectionBadge>{badge}</SectionBadge>
      <BlurText text={title} style={{
        fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
        fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: 'white',
        lineHeight: 0.9, letterSpacing: '-2px', marginTop: 20, marginBottom: 20
      }} delay={90} />
      <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
        {sub}
      </p>
    </section>
  );
}

/* ─── section wrapper ─── */
function PageSection({ children, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div ref={ref}
      className="section-block"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65 }}
      style={{ padding: '80px 5%', maxWidth: 1280, margin: '0 auto', ...style }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════
   CURRICULUM PAGE
══════════════════════════════════════ */
const courses = [
  {
    tag: 'Foundation', num: '01',
    title: 'Cinematic Workflows',
    sub: 'Build the pipeline architecture used in Hollywood-grade AI production.',
    body: 'Start from zero and reach full cinematic mastery. You\'ll learn graph structure, model stacking, ControlNet integration, and professional-grade upscaling pipelines.',
    meta: ['14 modules', '8h 20m', 'All levels'],
    color: '#4f8ef7',
  },
  {
    tag: 'Advanced', num: '02',
    title: 'Custom Node Mastery',
    sub: 'Author, chain and publish your own ComfyUI nodes.',
    body: 'Go beyond installed packs. Learn Python node authoring, custom widget creation, multi-output routing, and publishing to the ComfyUI Registry.',
    meta: ['11 modules', '6h 10m', 'Intermediate+'],
    color: '#a78bfa',
  },
  {
    tag: 'Expert', num: '03',
    title: 'API Scaling & Deployment',
    sub: 'Expose your workflows as APIs and deploy to RunPod and JarvisLabs.',
    body: 'Production infrastructure for generative pipelines. ComfyUI-as-a-service, async queue management, autoscaling GPU pools, and cost optimization at scale.',
    meta: ['9 modules', '5h 40m', 'Advanced'],
    color: '#f59e0b',
  },
  {
    tag: 'Specialization', num: '04',
    title: 'Video & Motion Generation',
    sub: 'Temporal consistency, AnimateDiff, and multi-frame cinematic output.',
    body: 'The definitive guide to AI video in ComfyUI. AnimateDiff, Stable Video Diffusion, frame interpolation, and building automated post pipelines.',
    meta: ['12 modules', '7h 50m', 'Intermediate+'],
    color: '#34d399',
  },
  {
    tag: 'Specialization', num: '05',
    title: 'LoRA & Model Training',
    sub: 'Train custom styles, characters, and concepts on your own hardware.',
    body: 'From dataset curation to Kohya training scripts—integrated directly into your ComfyUI workflow. Ship custom LoRAs in under 48 hours.',
    meta: ['10 modules', '6h 30m', 'Advanced'],
    color: '#f87171',
  },
  {
    tag: 'New', num: '06',
    title: 'ComfyUI × LLM Agents',
    sub: 'Connect language models to your generative pipelines.',
    body: 'Orchestrate Claude, GPT-4o, and local LLMs as prompt engineers inside your ComfyUI graph. Build self-optimizing creative agents.',
    meta: ['8 modules', '4h 20m', 'Expert'],
    color: '#e879f9',
  },
];

function CurriculumPage({ setPage }) {
  const [active, setActive] = useState(null);
  return (
    <div>
      <PageHero
        badge="Curriculum"
        title="Mastery, module by module."
        sub="Six comprehensive tracks. Every one engineered to take you from concept to production-grade output."
      />

      {/* Course Grid */}
      <PageSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {courses.map((c, i) => (
            <motion.div key={i}
              className="liquid-glass"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              style={{ borderRadius: 22, padding: '36px 32px', cursor: 'pointer', borderTop: `2px solid ${c.color}44`, position: 'relative', overflow: 'hidden' }}
              onClick={() => setActive(active === i ? null : i)}
            >
              {/* Number */}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '4rem', color: 'rgba(255,255,255,0.06)', position: 'absolute', top: 20, right: 28, lineHeight: 1 }}>{c.num}</span>
              {/* Tag */}
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 9999, background: `${c.color}22`, marginBottom: 20 }}>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.68rem', color: c.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.tag}</span>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.8rem', color: 'white', lineHeight: 1.05, marginBottom: 10 }}>{c.title}</h3>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>{c.sub}</p>

              {active === i && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: 20, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  {c.body}
                </motion.p>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {c.meta.map((m, j) => (
                  <span key={j} style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{m}</span>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <GlassBtn style={{ fontSize: '0.8rem', padding: '8px 18px' }}>
                  Enroll <ArrowUpRight size={13} />
                </GlassBtn>
              </div>
            </motion.div>
          ))}
        </div>
      </PageSection>

      {/* Learning Path */}
      <PageSection style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <SectionBadge>Your Path</SectionBadge>
            <SectionHeading style={{ marginTop: 16, marginBottom: 20 }}>Structured for depth.</SectionHeading>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
              Every track builds on the last. Start with Cinematic Workflows and graduate to deploying production APIs—in a single cohesive learning arc.
            </p>
            <GlassBtn onClick={() => setPage('pricing')}>View Pricing <ArrowUpRight size={14} /></GlassBtn>
          </div>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Understand the graph paradigm', 'Build cinematic pipelines', 'Author custom nodes', 'Deploy & scale via API', 'Train custom models', 'Orchestrate LLM agents'].map((step, i) => (
              <div key={i} className="liquid-glass" style={{ borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   COMMUNITY PAGE
══════════════════════════════════════ */
function CommunityPage({ setPage }) {
  const stats = [
    { val: '12,400+', label: 'Active members' },
    { val: '340+', label: 'Workflows shared' },
    { val: '28', label: 'Live workshops / mo' },
    { val: '4.9★', label: 'Community rating' },
  ];
  const features = [
    { icon: MessageSquare, title: 'Live Critique Sessions', body: 'Weekly live reviews where instructors break down your workflows node by node. Real feedback, no filler.' },
    { icon: Globe, title: 'Workflow Marketplace', body: 'Share, discover, and remix ComfyUI workflows built by the best generative artists in the community.' },
    { icon: Users, title: 'Study Cohorts', body: 'Matched with a small group at your level. Async collaboration, shared checkpoints, peer review.' },
    { icon: Award, title: 'Certifications', body: 'Complete a track and earn a verifiable ATREOX AI certificate—recognized across the AI industry.' },
    { icon: Zap, title: 'Challenge Sprints', body: 'Monthly 48-hour creative sprints with real prizes. Build something extraordinary in a single weekend.' },
    { icon: Code2, title: 'Open Node Registry', body: 'Publish your custom nodes to the ATREOX community registry. Get feedback, stars, and attribution.' },
  ];
  return (
    <div>
      <PageHero
        badge="Community"
        title="Create together. Grow faster."
        sub="A global network of ComfyUI practitioners, prompt engineers, and generative artists pushing the medium forward."
      />

      {/* Stats row */}
      <PageSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          {stats.map(({ val, label }, i) => (
            <div key={i} className="liquid-glass" style={{ borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2.8rem', color: 'white', lineHeight: 1 }}>{val}</div>
              <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>{label}</div>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Feature cards */}
      <PageSection style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionBadge>What's Inside</SectionBadge>
          <SectionHeading style={{ marginTop: 16 }}>Your creative home base.</SectionHeading>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="liquid-glass" style={{ borderRadius: 20, padding: '28px 24px' }}>
              <div className="liquid-glass-strong" style={{ width: 42, height: 42, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon size={17} color="white" />
              </div>
              <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.93rem', color: 'white', marginBottom: 10 }}>{title}</h4>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Discord CTA */}
      <PageSection style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="liquid-glass" style={{ borderRadius: 28, padding: '60px 48px', display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <SectionBadge>Discord Server</SectionBadge>
            <SectionHeading style={{ marginTop: 16, marginBottom: 16 }}>12,000 nodes. One channel.</SectionHeading>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 28 }}>
              Join the most active ComfyUI community on the internet. Share workflows, ask questions, and build alongside the best.
            </p>
            <GlassBtn>Join Discord <ArrowUpRight size={14} /></GlassBtn>
          </div>
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['#workflow-showcase', '#custom-nodes', '#help-desk', '#critique-sessions', '#model-releases'].map((ch) => (
              <div key={ch} className="liquid-glass" style={{ borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{ch}</span>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   PRICING PAGE
══════════════════════════════════════ */
function PricingPage({ setPage }) {
  const tiers = [
    {
      name: 'Explorer', price: '$0', period: 'forever',
      desc: 'Start your ComfyUI journey with no commitment.',
      features: ['Access to Module 1 of every track', 'Community Discord access', 'Weekly live Q&A', '1 workflow critique / month'],
      cta: 'Start Free', highlight: false
    },
    {
      name: 'Practitioner', price: '$49', period: 'per month',
      desc: 'Full curriculum access for serious creators.',
      features: ['All 6 course tracks', 'Live critique sessions', 'Workflow marketplace access', 'Study cohort matching', 'Monthly challenge sprints', 'Completion certificates'],
      cta: 'Start Practitioner', highlight: true
    },
    {
      name: 'Studio', price: '$149', period: 'per month',
      desc: 'For teams and production pipelines at scale.',
      features: ['Everything in Practitioner', 'Up to 5 team seats', 'Private cohort channel', 'API deployment workshop', 'Monthly 1-on-1 review', 'Priority node registry review'],
      cta: 'Contact Us', highlight: false
    },
  ];

  return (
    <div>
      <PageHero
        badge="Pricing"
        title="Simple, honest pricing."
        sub="No hidden fees. No locked content. Just the curriculum you need to go from node-curious to production-ready."
      />

      {/* Tier cards */}
      <PageSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {tiers.map((tier, i) => (
            <div key={i} className={tier.highlight ? 'liquid-glass-strong' : 'liquid-glass'}
              style={{ borderRadius: 24, padding: '40px 32px', position: 'relative', border: tier.highlight ? '1px solid rgba(255,255,255,0.2)' : undefined }}>
              {tier.highlight && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'white', color: 'black', borderRadius: 9999, padding: '3px 14px', fontSize: '0.7rem', fontFamily: 'Barlow, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>{tier.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '3.2rem', color: 'white', lineHeight: 1 }}>{tier.price}</span>
                <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>/ {tier.period}</span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.45)', marginBottom: 28, lineHeight: 1.6 }}>{tier.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={14} color="rgba(255,255,255,0.5)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.65)' }}>{f}</span>
                  </div>
                ))}
              </div>
              {tier.highlight
                ? <GlassBtn white onClick={() => setPage('curriculum')}>{tier.cta} <ArrowUpRight size={14} /></GlassBtn>
                : <GlassBtn onClick={() => setPage('curriculum')}>{tier.cta} <ArrowUpRight size={14} /></GlassBtn>
              }
            </div>
          ))}
        </div>
      </PageSection>

      {/* FAQ */}
      <PageSection style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionBadge>FAQ</SectionBadge>
            <SectionHeading style={{ marginTop: 14 }}>Questions, answered.</SectionHeading>
          </div>
          {[
            { q: 'Do I need prior ComfyUI experience?', a: 'No. The Cinematic Workflows track starts from complete zero. We assume you know what a GPU is, and nothing more.' },
            { q: 'Can I cancel anytime?', a: 'Yes. All subscriptions are month-to-month with no lock-in. Cancel from your dashboard in one click.' },
            { q: 'What hardware do I need?', a: 'A modern GPU (RTX 3060 or better) is recommended. Cloud GPU options via RunPod and JarvisLabs are covered in the API Scaling track.' },
            { q: 'Are the certificates recognized?', a: 'ATREOX AI certificates are verifiable on-chain and recognized by studios, agencies, and AI product teams globally.' },
          ].map(({ q, a }, i) => (
            <div key={i} className="liquid-glass" style={{ borderRadius: 16, padding: '22px 24px', marginBottom: 12 }}>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.9rem', color: 'white', marginBottom: 8 }}>{q}</p>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

/* ══════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════ */
function AboutPage({ setPage }) {
  const values = [
    { icon: Layers, title: 'Production over theory', body: 'Every package and lesson ends with something you can use immediately. No sandbox demos. No theory-only modules.' },
    { icon: Globe, title: 'No fake scarcity', body: 'Honest pricing. Honest limits. Limited licenses are limited because the model loses value otherwise — not as a sales tactic.' },
    { icon: Sparkles, title: 'NSFW without shame', body: 'We sell NSFW add-ons openly. The demand is real. The income is real. We treat it as a legitimate creative vertical.' },
    { icon: GitBranch, title: 'Open knowledge', body: 'The workflows, nodes, and pipeline I use to run Sena Xo are the same ones you get. Nothing held back for a higher tier.' },
  ];

  const stack = ['Flux 1.dev', 'WAN 2.2', 'ComfyUI', 'RunPod', 'Vercel'];

  return (
    <div>
      <PageHero
        badge="About"
        title="Built by creators. For creators."
        sub="ATREOX AI is a one-person operation built in public. Every asset sold is one I built and used myself."
      />

      {/* Origin story */}
      <PageSection>
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <SectionBadge>The story</SectionBadge>
            <SectionHeading style={{ marginTop: 16, marginBottom: 24 }}>One founder. One character. Real revenue.</SectionHeading>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
              I'm Dmytro. I built Sena Xo — an AI influencer generating real income on Fanvue and Telegram — using the exact Flux fine-tunes and ComfyUI pipelines I now sell through ATREOX.
              <br /><br />
              There's no team of instructors. No fake credentials. Just a working pipeline, a public build journey, and assets that I use every day.
            </p>
          </div>
          <div style={{ flex: '1 1 320px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {values.map(({ icon: Icon, title, body }, i) => (
              <div key={i} className="liquid-glass" style={{ borderRadius: 18, padding: '22px 20px' }}>
                <Icon size={18} color="rgba(255,255,255,0.5)" style={{ marginBottom: 12 }} />
                <h4 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.84rem', color: 'white', marginBottom: 8 }}>{title}</h4>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      {/* Tech stack */}
      <PageSection style={{ borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <SectionBadge>Tech Stack</SectionBadge>
        <SectionHeading style={{ marginTop: 16, marginBottom: 40 }}>What powers ATREOX.</SectionHeading>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {stack.map(item => (
            <div key={item} className="liquid-glass" style={{ borderRadius: 9999, padding: '10px 24px' }}>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 400, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{item}</span>
            </div>
          ))}
        </div>
      </PageSection>

      {/* CTA */}
      <PageSection style={{ borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <SectionHeading style={{ marginBottom: 20 }}>Ready to start?</SectionHeading>
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Browse the packages, read how it works, or jump straight to the course.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <GlassBtn white onClick={() => setPage('pricing')}>Browse Pricing <ArrowUpRight size={14} /></GlassBtn>
          <GlassBtn onClick={() => setPage('how-it-works')}>How It Works <ArrowUpRight size={14} /></GlassBtn>
        </div>
      </PageSection>

      <div style={{ padding: '0 5% 64px' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

Object.assign(window, { CurriculumPage, CommunityPage, PricingPage, AboutPage, PageHero, PageSection });

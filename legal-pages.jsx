
const React = window.React;
const { SectionBadge, FooterBar, BlurText, GlassBtn, ArrowUpRight } = window;

function LegalPage({ badge, title, lastUpdated, sections, setPage }) {
  return (
    <div>
      <section style={{ paddingTop: 140, paddingBottom: 60, paddingLeft: '5%', paddingRight: '5%', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <SectionBadge>{badge}</SectionBadge>
        <BlurText text={title} style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
          fontSize: 'clamp(2.4rem, 4.5vw, 4rem)', color: 'white',
          lineHeight: 0.9, letterSpacing: '-2px', marginTop: 20, marginBottom: 16,
        }} delay={80} />
        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
          Last updated: {lastUpdated}
        </p>
      </section>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 5% 40px' }}>
        {sections.map(({ heading, body }, i) => (
          <div key={i} style={{ marginBottom: 48 }}>
            {heading && (
              <h3 style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'white', marginBottom: 14, letterSpacing: '-0.01em' }}>
                {i + 1}. {heading}
              </h3>
            )}
            {Array.isArray(body) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {body.map((para, j) => (
                  <p key={j} style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                {body}
              </p>
            )}
            {i < sections.length - 1 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginTop: 48 }} />
            )}
          </div>
        ))}

        <div className="liquid-glass" style={{ borderRadius: 18, padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: '0.88rem', color: 'white', marginBottom: 4 }}>Questions about this policy?</p>
            <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Contact us at <a href="mailto:dsevcenko006@gmail.com" style={{ color: '#4f8ef7', textDecoration: 'none' }}>dsevcenko006@gmail.com</a></p>
          </div>
          <GlassBtn onClick={() => setPage('contact')}>Contact Us <ArrowUpRight size={14} /></GlassBtn>
        </div>
      </div>

      <div style={{ padding: '0 5% 0' }}><FooterBar setPage={setPage} /></div>
    </div>
  );
}

function PrivacyPage({ setPage }) {
  const sections = [
    {
      heading: 'Information We Collect',
      body: [
        'We collect information you provide directly to us when you create an account, purchase a course, or contact us. This includes your name, email address, payment information, and any communications you send us.',
        'We also automatically collect certain information when you use our platform, including your IP address, browser type, operating system, referring URLs, device information, and pages visited. This information is collected through cookies and similar tracking technologies.',
      ],
    },
    {
      heading: 'How We Use Your Information',
      body: [
        'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.',
        'We may also use your information to send you marketing communications about courses, updates, and promotions — but only with your consent, and you may opt out at any time.',
        'We use aggregated, anonymised data to analyse trends, monitor the effectiveness of our platform, and make informed decisions about platform improvements.',
      ],
    },
    {
      heading: 'Information Sharing',
      body: [
        'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, conducting our business, or servicing you — provided they agree to keep your information confidential.',
        'We may disclose your information when required by law, to enforce our site policies, or to protect ours or others\' rights, property, or safety.',
      ],
    },
    {
      heading: 'Data Security',
      body: 'We implement industry-standard security measures to protect your personal information. All payment data is encrypted using SSL technology. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
    },
    {
      heading: 'Cookies',
      body: [
        'Our platform uses cookies to enhance your experience, analyse site usage, and assist in our marketing efforts. Cookies are small data files stored on your device.',
        'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our service may not function properly.',
      ],
    },
    {
      heading: 'Your Rights',
      body: [
        'You have the right to access, correct, or delete your personal data at any time. You may also request that we restrict processing of your data or object to certain uses.',
        'To exercise these rights, please contact us at dsevcenko006@gmail.com. We will respond to all requests within 30 days.',
      ],
    },
    {
      heading: 'Children\'s Privacy',
      body: 'Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child under 16 has provided us with personal information, we will take steps to delete such information.',
    },
    {
      heading: 'Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after any changes constitutes your acceptance of the new policy.',
    },
  ];
  return <LegalPage badge="Legal" title="Privacy Policy." lastUpdated="April 24, 2026" sections={sections} setPage={setPage} />;
}

function TermsPage({ setPage }) {
  const sections = [
    {
      heading: 'Acceptance of Terms',
      body: 'By accessing or using ATREOX AI ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use the platform.',
    },
    {
      heading: 'Use of the Platform',
      body: [
        'You may use ATREOX AI only for lawful purposes and in accordance with these Terms. You agree not to use the platform in any way that violates applicable local, national, or international laws or regulations.',
        'You must not attempt to gain unauthorised access to any part of the platform, interfere with its operation, or transmit any harmful or malicious code. Violations may result in immediate termination of your account.',
      ],
    },
    {
      heading: 'Account Registration',
      body: [
        'To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.',
        'You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. We reserve the right to suspend or terminate accounts with inaccurate information.',
      ],
    },
    {
      heading: 'Intellectual Property',
      body: [
        'All content on ATREOX AI — including course materials, videos, workflows, written content, and software — is the exclusive property of ATREOX AI and is protected by international copyright laws.',
        'You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any content from the platform without our explicit written permission. Personal, non-commercial use of course materials for your own learning is permitted.',
      ],
    },
    {
      heading: 'Payments and Refunds',
      body: [
        'All purchases are processed securely through our payment provider. Subscription fees are charged on a recurring basis unless you cancel before the next billing cycle.',
        'We offer a 30-day money-back guarantee for all paid courses. If you are unsatisfied for any reason, contact us within 30 days of purchase for a full refund. Refunds are not available after 30 days.',
        'Prices are subject to change with 30 days\' notice. Any price changes will not affect your current billing period.',
      ],
    },
    {
      heading: 'User-Generated Content',
      body: 'You retain ownership of any workflows, projects, or content you create using our platform. However, by sharing content in community spaces, you grant ATREOX AI a non-exclusive licence to display and share that content for promotional and educational purposes.',
    },
    {
      heading: 'Disclaimer of Warranties',
      body: 'The platform is provided on an "as is" and "as available" basis without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components. Your use of the platform is at your sole risk.',
    },
    {
      heading: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, ATREOX AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the platform or its content.',
    },
    {
      heading: 'Governing Law',
      body: 'These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions. Any disputes arising under these Terms shall be resolved through binding arbitration.',
    },
    {
      heading: 'Changes to Terms',
      body: 'We reserve the right to modify these Terms at any time. We will provide at least 14 days\' notice before any significant changes take effect. Your continued use of the platform after changes constitutes acceptance of the revised Terms.',
    },
  ];
  return <LegalPage badge="Legal" title="Terms of Service." lastUpdated="April 24, 2026" sections={sections} setPage={setPage} />;
}

Object.assign(window, { PrivacyPage, TermsPage });

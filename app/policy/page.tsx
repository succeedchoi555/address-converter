export default function PrivacyPage() {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111', marginBottom: '1rem' }}>Privacy Policy</h1>
          
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>Last updated: January 31, 2026</p>
  
          <div style={{ lineHeight: '1.8', color: '#374151' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Introduction</h2>
              <p>
                World Address ("we," "our," or "us") respects your privacy and is committed to protecting 
                your personal data. This privacy policy explains how we collect, use, and safeguard your 
                information when you visit our website.
              </p>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Information We Collect</h2>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111', marginTop: '1rem', marginBottom: '0.5rem' }}>Address Data</h3>
              <p style={{ marginBottom: '1rem' }}>
                When you use our address conversion service, the addresses you input are processed 
                in real-time but are not permanently stored on our servers.
              </p>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111', marginBottom: '0.5rem' }}>Automatically Collected Information</h3>
              <ul style={{ marginLeft: '1.5rem', listStyle: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>Browser type and version</li>
                <li style={{ marginBottom: '0.5rem' }}>Operating system</li>
                <li style={{ marginBottom: '0.5rem' }}>IP address (anonymized)</li>
                <li style={{ marginBottom: '0.5rem' }}>Pages visited and time spent on pages</li>
                <li style={{ marginBottom: '0.5rem' }}>Referring website</li>
              </ul>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>How We Use Your Information</h2>
              <p style={{ marginBottom: '1rem' }}>We use the collected information for:</p>
              <ul style={{ marginLeft: '1.5rem', listStyle: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>Providing and improving our address conversion service</li>
                <li style={{ marginBottom: '0.5rem' }}>Analyzing website usage and performance</li>
                <li style={{ marginBottom: '0.5rem' }}>Detecting and preventing technical issues</li>
                <li style={{ marginBottom: '0.5rem' }}>Complying with legal obligations</li>
              </ul>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Cookies and Tracking</h2>
              <p style={{ marginBottom: '1rem' }}>
                We use cookies and similar tracking technologies to improve your experience. You can 
                control cookie settings through your browser preferences.
              </p>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111', marginBottom: '0.5rem' }}>Third-Party Services</h3>
              <p style={{ marginBottom: '0.5rem' }}>We use the following third-party services:</p>
              <ul style={{ marginLeft: '1.5rem', listStyle: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Google AdSense:</strong> For displaying advertisements. Google may use cookies 
                  to show ads based on your visits to this and other websites.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Google Maps API:</strong> For address autocomplete and geocoding functionality.
                </li>
              </ul>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your data 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Your Rights</h2>
              <p style={{ marginBottom: '1rem' }}>You have the right to:</p>
              <ul style={{ marginLeft: '1.5rem', listStyle: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>Access your personal data</li>
                <li style={{ marginBottom: '0.5rem' }}>Request correction of inaccurate data</li>
                <li style={{ marginBottom: '0.5rem' }}>Request deletion of your data</li>
                <li style={{ marginBottom: '0.5rem' }}>Object to data processing</li>
                <li style={{ marginBottom: '0.5rem' }}>Withdraw consent at any time</li>
              </ul>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Children's Privacy</h2>
              <p>
                Our service is not directed to children under 13. We do not knowingly collect personal 
                information from children under 13.
              </p>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page with an updated "Last updated" date.
              </p>
            </section>
  
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Contact Us</h2>
              <p style={{ marginBottom: '0.5rem' }}>
                If you have questions about this privacy policy, please contact us at:
              </p>
              <p>
                Email: <a href="succeedchoi555@gmail.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  privacy@worldaddress.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    )
  }
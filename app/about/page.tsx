export default function AboutPage() {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111', marginBottom: '1.5rem' }}>About World Address</h1>
          
          <div style={{ lineHeight: '1.8', color: '#374151' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Our Mission</h2>
              <p>
                World Address is dedicated to making international communication easier by providing 
                accurate and instant address translation services. We help people convert addresses from 
                any language to English format for overseas shipping, international mail, and global communication.
              </p>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>What We Do</h2>
              <p style={{ marginBottom: '1rem' }}>
                Our service simplifies the complex process of address translation, ensuring that your 
                packages, letters, and documents reach their destination without confusion.
              </p>
              <ul style={{ marginLeft: '1.5rem', listStyle: 'disc' }}>
                <li style={{ marginBottom: '0.5rem' }}>Convert addresses from any language to proper English format</li>
                <li style={{ marginBottom: '0.5rem' }}>Automatic address formatting for international standards</li>
                <li style={{ marginBottom: '0.5rem' }}>Support for apartments, buildings, and complex addresses</li>
                <li style={{ marginBottom: '0.5rem' }}>Helpful guides and tips for international shipping</li>
              </ul>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Why Choose Us</h2>
              
              <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Accuracy</h3>
                <p>We follow international address standards to ensure your addresses are formatted correctly.</p>
              </div>
  
              <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Easy to Use</h3>
                <p>Simple interface with instant results - just type your address and get the result.</p>
              </div>
  
              <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Free Service</h3>
                <p>Completely free to use with no registration required.</p>
              </div>
  
              <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '1rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Privacy First</h3>
                <p>We never collect or store your personal information.</p>
              </div>
            </section>
  
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Our Story</h2>
              <p>
                World Address was created to solve a common problem faced by people when dealing with 
                international transactions. We understand the frustration of incorrectly formatted addresses 
                leading to delayed or lost shipments. Our goal is to eliminate these issues by providing a 
                reliable, easy-to-use address conversion tool that works with any language.
              </p>
            </section>
  
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111', marginBottom: '1rem' }}>Contact Us</h2>
              <p style={{ marginBottom: '0.5rem' }}>
                Have questions or feedback? We'd love to hear from you.
              </p>
              <p>
                Email: <a href="mailto:succeedchoi555@gmail.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                succeedchoi555@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    )
  }

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import UploadForm from './UploadForm';
import MusicList from './MusicList';

// --- DASHBOARD COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.dashboard}>
      <h1 style={styles.heroText}>ADMIN CONSOLE</h1>
      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/upload')}>
          <span style={styles.cardIcon}>+</span>
          <h3>UPLOAD MIX</h3>
          <p>Initialize new transmission</p>
        </div>
        <div style={styles.card} onClick={() => navigate('/manage')}>
          <span style={styles.cardIcon}>≡</span>
          <h3>MANAGE ARCHIVE</h3>
          <p>Edit or delete records</p>
        </div>
      </div>
    </div>
  );
};

// --- NAVBAR COMPONENT ---
const Navbar = () => (
  <nav style={styles.navbar}>
    <div style={styles.logo}>DJKACE // ADMIN</div>
    <div style={styles.navLinks}>
      <Link to="/" style={styles.link}>HOME</Link>
      <Link to="/upload" style={styles.link}>UPLOAD</Link>
      <Link to="/manage" style={styles.link}>MANAGE</Link>
    </div>
  </nav>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  return (
    <Router>
      <div style={styles.appContainer}>
        <Navbar />
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<div style={styles.pageContainer}><h2 style={styles.pageTitle}>UPLOAD MIX</h2><UploadForm /></div>} />
            <Route path="/manage" element={<div style={styles.pageContainer}><h2 style={styles.pageTitle}>MANAGE DATABASE</h2><MusicList /></div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const styles = {
  appContainer: {
    fontFamily: '"Space Mono", monospace',
    backgroundColor: '#F1E9DB',
    width: '100vw',
    minHeight: '100vh',
    color: '#111',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '2px solid #111',
    backgroundColor: '#F1E9DB',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { fontWeight: '900', letterSpacing: '2px', fontSize: '1.2rem' },
  navLinks: { display: 'flex', gap: '20px' },
  link: { textDecoration: 'none', color: '#111', fontWeight: 'bold', fontSize: '0.9rem' },
  content: { padding: '40px' },
  pageContainer: { maxWidth: '800px', margin: '0 auto' },
  pageTitle: { borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '30px' },
  
  // Dashboard Styles
  dashboard: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' },
  heroText: { fontSize: '3rem', marginBottom: '40px', fontWeight: '900' },
  grid: { display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: '250px', height: '250px',
    border: '2px solid #111',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fff'
  },
  cardIcon: { fontSize: '4rem', marginBottom: '10px' }
};

export default App;
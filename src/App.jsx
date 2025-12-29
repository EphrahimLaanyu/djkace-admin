import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import MusicList from './MusicList';       
import YouTubeManager from './YouTubeManager'; 
import MessagesList from './MessagesList'; 

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ unreadCount }) => {
  const navigate = useNavigate();

  return (
    <div style={styles.dashboard}>
      <h1 className="hero-text" style={styles.heroText}>ADMIN CONSOLE</h1>
      
      {/* Added 'dashboard-grid' class for media queries */}
      <div className="dashboard-grid" style={styles.grid}>
        
        {/* MIXES */}
        <div className="dashboard-card" style={styles.card} onClick={() => navigate('/mixes')}>
          <span style={styles.cardIcon}>🎵</span>
          <div>
            <h3>AUDIO MIXES</h3>
            <p>Upload & Manage MP3s</p>
          </div>
        </div>

        {/* YOUTUBE */}
        <div className="dashboard-card" style={styles.card} onClick={() => navigate('/youtube')}>
          <span style={styles.cardIcon}>▶</span>
          <div>
            <h3>YOUTUBE</h3>
            <p>Manage Video Links</p>
          </div>
        </div>

        {/* INBOX */}
        <div className="dashboard-card" style={styles.card} onClick={() => navigate('/inbox')}>
          <div style={styles.iconWrapper}>
             <span style={styles.cardIcon}>✉</span>
             {unreadCount > 0 && <div style={styles.badge}>{unreadCount}</div>}
          </div>
          <div>
            <h3>INBOX</h3>
            <p>{unreadCount > 0 ? `${unreadCount} NEW MESSAGES` : 'Check client messages'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- NAVBAR COMPONENT ---
const Navbar = ({ unreadCount }) => {
    const location = useLocation();
    const getStyle = (path) => ({
        ...styles.link,
        borderBottom: location.pathname === path ? '2px solid #E60000' : 'none'
    });

    return (
      <nav className="navbar" style={styles.navbar}>
        <div style={styles.logo}>DJKACE // ADMIN</div>
        <div className="nav-links" style={styles.navLinks}>
          <Link to="/" style={styles.link}>DASHBOARD</Link>
          <Link to="/mixes" style={getStyle('/mixes')}>MIXES</Link>
          <Link to="/youtube" style={getStyle('/youtube')}>YOUTUBE</Link>
          <Link to="/inbox" style={getStyle('/inbox')}>
            INBOX 
            {unreadCount > 0 && <span style={styles.navBadge}>({unreadCount})</span>}
          </Link>
        </div>
      </nav>
    );
};

// --- MAIN APP ---
const App = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkInbox = async () => {
        try {
            const res = await fetch('https://djkace-api.elaanyu.workers.dev/messages');
            const data = await res.json();
            const unread = data.filter(msg => !msg.is_read).length;
            setUnreadCount(unread);
        } catch (e) { console.error(e); }
    };
    
    checkInbox(); 
    const interval = setInterval(checkInbox, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div style={styles.appContainer}>
        
        {/* --- RESPONSIVE CSS INJECTION --- */}
        <style>{`
            /* Mobile Adjustments */
            @media (max-width: 768px) {
                /* Navbar Stacking */
                .navbar {
                    flex-direction: column !important;
                    gap: 15px;
                    padding: 15px !important;
                }
                .nav-links {
                    width: 100%;
                    justify-content: space-between !important;
                    gap: 10px !important;
                    flex-wrap: wrap;
                }
                .nav-links a {
                    font-size: 0.8rem !important;
                }

                /* Layout Padding */
                .app-content {
                    padding: 20px 15px !important;
                }

                /* Dashboard Grid */
                .hero-text {
                    font-size: 2rem !important;
                    margin-bottom: 30px !important;
                }
                .dashboard-grid {
                    flex-direction: column !important;
                    width: 100% !important;
                    gap: 20px !important;
                }
                
                /* Dashboard Cards -> Turn from squares to rows on mobile */
                .dashboard-card {
                    width: 100% !important;
                    height: auto !important;
                    flex-direction: row !important;
                    justify-content: flex-start !important;
                    padding: 20px !important;
                    text-align: left !important;
                    gap: 20px;
                }
                .dashboard-card span {
                    font-size: 2.5rem !important;
                    margin-bottom: 0 !important;
                }
                .dashboard-card h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }
                .dashboard-card p {
                    margin: 5px 0 0 0;
                    font-size: 0.8rem;
                }
            }
        `}</style>

        <Navbar unreadCount={unreadCount} />
        
        {/* Added class app-content for padding control */}
        <div className="app-content" style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard unreadCount={unreadCount} />} />
            <Route path="/mixes" element={<div style={styles.pageContainer}><MusicList /></div>} />
            <Route path="/youtube" element={<div style={styles.pageContainer}><YouTubeManager /></div>} />
            <Route path="/inbox" element={<div style={styles.pageContainer}><h2 style={styles.pageTitle}>INBOX</h2><MessagesList /></div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const styles = {
  appContainer: { fontFamily: '"Space Mono", monospace', backgroundColor: '#F1E9DB', width: '100vw', minHeight: '100vh', color: '#111', overflowX: 'hidden' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '2px solid #111', backgroundColor: '#F1E9DB', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontWeight: '900', letterSpacing: '2px', fontSize: '1.2rem' },
  navLinks: { display: 'flex', gap: '30px' },
  link: { textDecoration: 'none', color: '#111', fontWeight: 'bold', fontSize: '0.9rem', paddingBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' },
  navBadge: { color: '#E60000', fontSize: '0.8rem', fontWeight: '900' },
  
  content: { padding: '40px' },
  pageContainer: { maxWidth: '800px', margin: '0 auto' },
  pageTitle: { borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '30px' },
  
  dashboard: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', width: '100%' },
  heroText: { fontSize: '3rem', marginBottom: '40px', fontWeight: '900', textAlign: 'center' },
  grid: { display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  
  card: { width: '250px', height: '250px', border: '2px solid #111', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fff', textAlign: 'center', padding: '20px' },
  iconWrapper: { position: 'relative', display: 'inline-block' },
  cardIcon: { fontSize: '4rem', marginBottom: '10px', display: 'block' },
  badge: { position: 'absolute', top: 0, right: -10, backgroundColor: '#E60000', color: '#fff', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid #fff' }
};

export default App;
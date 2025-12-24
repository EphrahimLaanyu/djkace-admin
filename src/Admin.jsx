import React from 'react';
import UploadForm from './/UploadForm';
import MusicList from './/MusicList';

const Admin = () => {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* HEADER SECTION */}
        <div style={styles.header}>
            <h1 style={styles.title}>SYSTEM ADMIN // UPLOAD PORTAL</h1>
            <div style={styles.subHeader}>
                <span>AUTHORIZED PERSONNEL ONLY</span>
                <span>ID: ADMIN-001</span>
            </div>
            <div style={styles.divider}>============================================</div>
        </div>

        {/* UPLOAD SECTION */}
        <section style={styles.section}>
            <div style={styles.sectionLabel}>[ NEW TRANSMISSION ]</div>
            <UploadForm />
        </section>

        <div style={styles.divider}>--------------------------------------------</div>

        {/* LIST SECTION */}
        <section style={styles.section}>
            <div style={styles.sectionLabel}>[ ARCHIVE DATABASE ]</div>
            <MusicList />
        </section>

      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#F1E9DB',
    color: '#111',
    fontFamily: '"Space Mono", monospace',
    display: 'flex',
    justifyContent: 'center',
    // UPDATED PADDING: Clears the fixed Navbar
    padding: '120px 20px 50px',
  },
  container: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '900',
    letterSpacing: '-1px',
    marginBottom: '5px',
    textTransform: 'uppercase',
  },
  subHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    opacity: 0.6,
    fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    opacity: 0.3,
    margin: '20px 0',
    userSelect: 'none',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#E60000',
    marginBottom: '10px',
  }
};

export default Admin;
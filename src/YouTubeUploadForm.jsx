import React, { useState } from 'react';

const YouTubeUploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    description: '',
    genre: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.link.includes('youtube.com') && !formData.link.includes('youtu.be')) {
        return alert("INVALID LINK: Please provide a valid YouTube URL.");
    }

    setLoading(true);

    try {
      // Note: You will need to add a handler for 'POST_YOUTUBE' in your worker later
      // For now, we assume the same endpoint handles logic based on payload or a new endpoint
      const res = await fetch('https://djkace-api.elaanyu.workers.dev/youtube', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(await res.text());

      // --- SUCCESS SEQUENCE ---
      setIsSuccess(true);
      setFormData({ title: '', link: '', description: '', genre: '' });
      e.target.reset();

      setTimeout(() => {
          setIsSuccess(false);
          setLoading(false);
      }, 3000);

    } catch (error) {
      console.error(error);
      alert(`ERROR: ${error.message || error}`);
      setLoading(false);
    }
  };

  if (isSuccess) {
      return (
          <div style={styles.successWrapper}>
              <div style={styles.tickCircle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={styles.tickSvg}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
              </div>
              <h2 style={styles.successTitle}>LINK ESTABLISHED</h2>
              <p style={styles.successSub}>YOUTUBE MIX INDEXED</p>
              <div style={styles.loadingBar}></div>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.group}>
        <label style={styles.label}>MIX TITLE</label>
        <input type="text" name="title" placeholder="ENTER TITLE..." value={formData.title} onChange={handleChange} required style={styles.input} autoComplete="off" />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>YOUTUBE LINK</label>
        <input type="text" name="link" placeholder="https://youtu.be/..." value={formData.link} onChange={handleChange} required style={styles.input} autoComplete="off" />
      </div>

      <div style={styles.row}>
        <div style={styles.group}>
            <label style={styles.label}>GENRE</label>
            <input type="text" name="genre" placeholder="GENRE..." value={formData.genre} onChange={handleChange} required style={styles.input} autoComplete="off" />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>DESCRIPTION</label>
        <textarea name="description" placeholder="DETAILS..." value={formData.description} onChange={handleChange} style={styles.textarea} rows="3" />
      </div>

      <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.5 : 1}}>
        {loading ? 'PROCESSING...' : '▶ INDEX YOUTUBE MIX'}
      </button>
    </form>
  );
};

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'flex', gap: '20px' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '0.6rem', fontWeight: 'bold', color: '#666', letterSpacing: '1px' },
  input: {
    background: 'transparent', border: 'none', borderBottom: '2px solid #111',
    padding: '10px 0', fontFamily: '"Space Mono", monospace', fontSize: '1rem',
    fontWeight: 'bold', color: '#111', outline: 'none', borderRadius: 0,
  },
  textarea: {
    background: '#fff', border: '2px solid #111', padding: '10px',
    fontFamily: '"Space Mono", monospace', fontSize: '0.9rem', color: '#111',
    outline: 'none', resize: 'vertical', borderRadius: 0,
  },
  button: {
    marginTop: '10px', padding: '20px', backgroundColor: '#111', color: '#F1E9DB',
    border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
    fontFamily: 'inherit', letterSpacing: '2px', textTransform: 'uppercase',
    transition: 'background 0.3s',
  },
  successWrapper: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '50px 0', animation: 'fadeIn 0.5s ease'
  },
  tickCircle: {
      width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#111',
      display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px'
  },
  tickSvg: { width: '40px', height: '40px', color: '#F1E9DB' },
  successTitle: { fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '1px', textAlign: 'center' },
  successSub: { fontSize: '0.9rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center' },
  loadingBar: {
      width: '50px', height: '4px', background: '#E60000', marginTop: '30px', animation: 'pulse 1s infinite' 
  }
};

export default YouTubeUploadForm;
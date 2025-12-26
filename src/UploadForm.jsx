import React, { useState, useEffect, useRef } from 'react';

// --- CUSTOM MINI PLAYER COMPONENT ---
const SimplePlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = (e) => {
    e.preventDefault();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div style={playerStyles.container}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded} 
      />
      
      {/* PLAY BUTTON */}
      <button onClick={togglePlay} style={playerStyles.button}>
        {isPlaying ? '||' : '▶'}
      </button>

      {/* PROGRESS BAR */}
      <div style={playerStyles.track}>
        <div style={{ ...playerStyles.bar, width: `${progress}%` }}></div>
      </div>

      {/* DECORATIVE LABEL */}
      <div style={playerStyles.meta}>PREVIEW</div>
    </div>
  );
};

const playerStyles = {
  container: {
    display: 'flex', alignItems: 'center', gap: '10px',
    border: '1px solid #111', padding: '8px',
    backgroundColor: '#fff', width: '100%',
    fontFamily: '"Space Mono", monospace',
    boxSizing: 'border-box'
  },
  button: {
    background: '#111', color: '#F1E9DB', border: 'none',
    padding: '5px 8px', fontSize: '0.6rem', fontWeight: 'bold',
    cursor: 'pointer', minWidth: '30px'
  },
  track: {
    flex: 1, height: '6px', background: '#eee',
    border: '1px solid #111', position: 'relative'
  },
  bar: {
    height: '100%', background: '#E60000', transition: 'width 0.1s linear'
  },
  meta: {
    fontSize: '0.5rem', color: '#999', letterSpacing: '1px'
  }
};

// --- MAIN FORM ---
const UploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    audioFile: null,
    coverFile: null
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false); // NEW: Success State

  // PREVIEW STATES
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // CLEANUP PREVIEWS
  useEffect(() => {
    return () => {
        if (audioPreview) URL.revokeObjectURL(audioPreview);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [audioPreview, coverPreview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      if (name === 'audioFile') {
          if (audioPreview) URL.revokeObjectURL(audioPreview);
          setAudioPreview(URL.createObjectURL(file));
      }
      if (name === 'coverFile') {
          if (coverPreview) URL.revokeObjectURL(coverPreview);
          setCoverPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const uploadFile = (url, file, isAudio) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);

      if (isAudio) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        };
      }

      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(`Upload failed: ${xhr.status}`));
      xhr.onerror = () => reject('Network error during upload');
      xhr.send(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.audioFile || !formData.coverFile) return alert("MISSING DATA: Please select both files.");

    setLoading(true);
    setUploadProgress(0);

    try {
      const res = await fetch('https://djkace-api.elaanyu.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          genre: formData.genre,
          audioName: formData.audioFile.name,
          audioSize: formData.audioFile.size,
          audioType: formData.audioFile.type,
          coverName: formData.coverFile.name,
          coverType: formData.coverFile.type,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { audioSignedUrl, coverSignedUrl } = await res.json();

      await uploadFile(audioSignedUrl, formData.audioFile, true);
      await uploadFile(coverSignedUrl, formData.coverFile, false);

      // --- SUCCESS SEQUENCE ---
      setIsSuccess(true); // Show Success Screen
      
      // Clear Data
      setFormData({ title: '', description: '', genre: '', audioFile: null, coverFile: null });
      setAudioPreview(null);
      setCoverPreview(null);
      e.target.reset();

      // Reset back to form after 3 seconds
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

  // --- RENDER SUCCESS VIEW ---
  if (isSuccess) {
      return (
          <div style={styles.successWrapper}>
              <div style={styles.tickCircle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={styles.tickSvg}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
              </div>
              <h2 style={styles.successTitle}>TRANSMISSION COMPLETE</h2>
              <p style={styles.successSub}>TRACK ARCHIVED SUCCESSFULLY</p>
              <div style={styles.loadingBar}></div>
          </div>
      );
  }

  // --- RENDER FORM VIEW ---
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      
      <div style={styles.group}>
        <label style={styles.label}>TRACK TITLE</label>
        <input type="text" name="title" placeholder="ENTER TITLE..." value={formData.title} onChange={handleChange} required style={styles.input} autoComplete="off" />
      </div>

      <div style={styles.row}>
        <div style={styles.group}>
            <label style={styles.label}>GENRE</label>
            <input type="text" name="genre" placeholder="GENRE..." value={formData.genre} onChange={handleChange} required style={styles.input} autoComplete="off" />
        </div>
      </div>

      <div style={styles.group}>
        <label style={styles.label}>DESCRIPTION / ARTIST</label>
        <textarea name="description" placeholder="DETAILS..." value={formData.description} onChange={handleChange} style={styles.textarea} rows="3" />
      </div>

      {/* FILE INPUTS WITH PREVIEW */}
      <div style={styles.fileGroup}>
        
        {/* AUDIO SECTION */}
        <div style={styles.group}>
            <label style={styles.label}>AUDIO SOURCE (MP3/WAV)</label>
            
            {audioPreview && (
                <div style={styles.previewWrapper}>
                    <SimplePlayer src={audioPreview} />
                </div>
            )}
            
            <input type="file" name="audioFile" accept="audio/*" onChange={handleChange} required style={styles.fileInput} />
        </div>
        
        <div style={styles.divider}></div>

        {/* COVER SECTION */}
        <div style={styles.group}>
            <label style={styles.label}>COVER ART (JPG/PNG)</label>
            
            {coverPreview && (
                <div style={styles.previewWrapper}>
                    <img src={coverPreview} alt="Cover Preview" style={styles.imagePreview} />
                </div>
            )}

            <input type="file" name="coverFile" accept="image/*" onChange={handleChange} required style={styles.fileInput} />
        </div>
      </div>

      {loading && !isSuccess && (
        <div style={styles.progressContainer}>
          <div style={styles.progressMeta}>
             <span>UPLOADING...</span>
             <span>{uploadProgress}%</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.5 : 1}}>
        {loading ? 'PROCESSING DATA...' : '▶ INITIATE UPLOAD'}
      </button>

    </form>
  );
};

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'flex', gap: '20px' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  
  label: { 
    fontSize: '0.6rem', fontWeight: 'bold', color: '#666', letterSpacing: '1px' 
  },
  
  input: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #111',
    padding: '10px 0',
    fontFamily: '"Space Mono", monospace',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#111',
    outline: 'none',
    borderRadius: 0,
  },
  
  textarea: {
    background: '#fff',
    border: '2px solid #111',
    padding: '10px',
    fontFamily: '"Space Mono", monospace',
    fontSize: '0.9rem',
    color: '#111',
    outline: 'none',
    resize: 'vertical',
    borderRadius: 0,
  },

  fileInput: {
    fontSize: '0.8rem',
    padding: '5px 0',
    cursor: 'pointer',
  },

  fileGroup: {
      border: '1px dashed #ccc',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      backgroundColor: 'rgba(255,255,255,0.5)'
  },

  divider: { height: '1px', background: '#ccc', width: '100%' },

  previewWrapper: { marginBottom: '10px', width: '100%' },
  imagePreview: { 
      width: '100px', height: '100px', objectFit: 'cover', 
      border: '2px solid #111', boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
  },

  button: {
    marginTop: '10px',
    padding: '20px',
    backgroundColor: '#111',
    color: '#F1E9DB',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    fontFamily: 'inherit',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'background 0.3s',
  },

  progressContainer: { marginTop: '10px' },
  progressMeta: {
      display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px'
  },
  progressBarBg: { width: '100%', height: '10px', background: '#ccc' },
  progressBarFill: { height: '100%', background: '#E60000', transition: 'width 0.2s ease' },

  // --- SUCCESS SCREEN STYLES ---
  successWrapper: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '50px 0', animation: 'fadeIn 0.5s ease'
  },
  tickCircle: {
      width: '80px', height: '80px', borderRadius: '50%',
      backgroundColor: '#111',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      marginBottom: '20px'
  },
  tickSvg: { width: '40px', height: '40px', color: '#F1E9DB' },
  successTitle: { fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '1px', textAlign: 'center' },
  successSub: { fontSize: '0.9rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center' },
  loadingBar: {
      width: '50px', height: '4px', background: '#E60000', marginTop: '30px',
      animation: 'pulse 1s infinite' 
  }
};

export default UploadForm;
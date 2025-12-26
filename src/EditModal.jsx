import React, { useState, useEffect, useRef } from 'react';

// --- CUSTOM MINI PLAYER COMPONENT (Same as UploadForm) ---
const SimplePlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = (e) => {
    e.preventDefault(); // Prevent form submission
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


// --- MAIN EDIT MODAL COMPONENT ---
const EditModal = ({ track, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: track.title,
    genre: track.genre,
    description: track.description,
    audioFile: null,
    coverFile: null
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // State for Previews
  const [newCoverPreview, setNewCoverPreview] = useState(null);
  const [newAudioPreview, setNewAudioPreview] = useState(null); // NEW: Audio Preview State

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (newCoverPreview) URL.revokeObjectURL(newCoverPreview);
      if (newAudioPreview) URL.revokeObjectURL(newAudioPreview);
    };
  }, [newCoverPreview, newAudioPreview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      
      if (name === 'coverFile') {
        setNewCoverPreview(URL.createObjectURL(files[0]));
      }
      // Generate preview for audio
      if (name === 'audioFile') {
         if (newAudioPreview) URL.revokeObjectURL(newAudioPreview);
         setNewAudioPreview(URL.createObjectURL(files[0]));
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
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(`Upload failed`));
      xhr.onerror = () => reject('Network error');
      xhr.send(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      const payload = {
        id: track.id,
        title: formData.title,
        genre: formData.genre,
        description: formData.description,
        isUpdate: true,
        ...(formData.audioFile && { 
            audioName: formData.audioFile.name, 
            audioSize: formData.audioFile.size, 
            audioType: formData.audioFile.type 
        }),
        ...(formData.coverFile && { 
            coverName: formData.coverFile.name, 
            coverType: formData.coverFile.type 
        })
      };

      const res = await fetch('https://djkace-api.elaanyu.workers.dev', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      
      const responseData = await res.json();

      if (formData.audioFile && responseData.audioSignedUrl) {
        await uploadFile(responseData.audioSignedUrl, formData.audioFile, true);
      }

      if (formData.coverFile && responseData.coverSignedUrl) {
        await uploadFile(responseData.coverSignedUrl, formData.coverFile, false);
      }

      onSave(); 
      setIsSuccess(true);
      setTimeout(() => {
          onClose(); 
      }, 2000);

    } catch (error) {
      console.error(error);
      alert(`Update Failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        {isSuccess ? (
            <div style={styles.successContainer}>
                <div style={styles.tickCircle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={styles.tickSvg}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h2 style={styles.successTitle}>SYSTEM UPDATE COMPLETE</h2>
                <p style={styles.successSub}>RECORDS SYNCHRONIZED</p>
            </div>
        ) : (
            <>
                <div style={styles.header}>
                    <h3>EDIT RECORD: {track.id}</h3>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.group}>
                        <label style={styles.label}>TITLE</label>
                        <input name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
                    </div>
                    
                    <div style={styles.group}>
                        <label style={styles.label}>GENRE</label>
                        <input name="genre" value={formData.genre} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.group}>
                        <label style={styles.label}>DESCRIPTION</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} style={styles.textarea} rows="3" />
                    </div>

                    <div style={styles.fileSection}>
                        {/* AUDIO */}
                        <div style={styles.group}>
                            <label style={styles.label}>REPLACE AUDIO (Optional)</label>
                            
                            <div style={styles.audioComparison}>
                                {/* Current Audio */}
                                <div style={styles.audioBox}>
                                    <span style={styles.previewLabel}>CURRENT:</span>
                                    {track.audio_url ? (
                                        <SimplePlayer src={track.audio_url} />
                                    ) : (
                                        <span style={styles.noFile}>NO AUDIO</span>
                                    )}
                                </div>
                                
                                {/* New Audio (if selected) */}
                                {formData.audioFile && newAudioPreview && (
                                    <>
                                        <div style={styles.arrowVertical}>↓</div>
                                        <div style={{...styles.audioBox, borderColor: '#E60000'}}>
                                            <span style={{...styles.previewLabel, color: '#E60000'}}>REPLACING WITH:</span>
                                            <SimplePlayer src={newAudioPreview} />
                                            <span style={styles.fileName}>{formData.audioFile.name}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <input type="file" name="audioFile" accept="audio/*" onChange={handleChange} style={styles.fileInput} />
                        </div>

                        <div style={styles.divider}></div>

                        {/* COVER */}
                        <div style={styles.group}>
                            <label style={styles.label}>REPLACE COVER (Optional)</label>
                            <div style={styles.comparisonRow}>
                                <div style={styles.previewBox}>
                                    <span style={styles.previewLabel}>CURRENT</span>
                                    {track.image_url ? (
                                        <img src={track.image_url} alt="Old" style={styles.imagePreview} />
                                    ) : (
                                        <div style={styles.noImage}>NO IMG</div>
                                    )}
                                </div>
                                <div style={styles.arrow}>{newCoverPreview ? '→' : ''}</div>
                                {newCoverPreview && (
                                    <div style={styles.previewBox}>
                                        <span style={{...styles.previewLabel, color: '#E60000'}}>NEW</span>
                                        <img src={newCoverPreview} alt="New" style={styles.imagePreview} />
                                    </div>
                                )}
                            </div>
                            <input type="file" name="coverFile" accept="image/*" onChange={handleChange} style={styles.fileInput} />
                        </div>
                    </div>

                    {loading && (
                        <div style={styles.progress}>
                            UPLOADING CHANGES... {formData.audioFile ? `${progress}%` : ''}
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={styles.saveBtn}>
                        {loading ? 'PROCESSING...' : 'SAVE CHANGES'}
                    </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  modal: {
    width: '90%', maxWidth: '500px', backgroundColor: '#F1E9DB', 
    border: '3px solid #111', padding: '30px', position: 'relative',
    boxShadow: '10px 10px 0px rgba(0,0,0,0.5)',
    maxHeight: '90vh', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', minHeight: '300px'
  },
  successContainer: {
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', gap: '20px',
      animation: 'fadeIn 0.5s ease'
  },
  tickCircle: {
      width: '80px', height: '80px', borderRadius: '50%',
      backgroundColor: '#111',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      marginBottom: '10px'
  },
  tickSvg: { width: '40px', height: '40px', color: '#F1E9DB' },
  successTitle: { fontSize: '1.5rem', fontWeight: '900', textAlign: 'center', margin: 0, letterSpacing: '1px' },
  successSub: { fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', margin: 0, letterSpacing: '2px' },

  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px', borderBottom: '2px solid #111', paddingBottom: '10px',
    color: '#111'
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', color: '#111'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.7rem', fontWeight: 'bold', color: '#666', letterSpacing: '1px' },
  input: {
    background: 'transparent', border: 'none', borderBottom: '2px solid #111',
    padding: '8px 0', fontSize: '1rem', fontFamily: 'monospace', width: '100%',
    color: '#111', outline: 'none'
  },
  textarea: {
    background: '#fff', border: '2px solid #111', padding: '10px',
    fontFamily: 'monospace', fontSize: '0.9rem', color: '#111', outline: 'none'
  },
  fileSection: {
    border: '2px dashed #666', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px',
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  fileInput: { fontSize: '0.85rem', color: '#111', cursor: 'pointer', marginTop: '5px' },
  
  // Audio Styles
  audioComparison: { display: 'flex', flexDirection: 'column', gap: '5px' },
  audioBox: {
      padding: '8px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px',
      display: 'flex', flexDirection: 'column', gap: '5px'
  },
  fileName: { fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '5px' },
  arrowVertical: { textAlign: 'center', fontWeight: 'bold', color: '#E60000', fontSize: '1.2rem' },

  // Image Styles
  comparisonRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' },
  previewBox: { display: 'flex', flexDirection: 'column', gap: '5px' },
  previewLabel: { fontSize: '0.6rem', fontWeight: 'bold', color: '#888' },
  imagePreview: { 
      width: '80px', height: '80px', objectFit: 'cover', 
      border: '2px solid #111', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)'
  },
  arrow: { fontSize: '1.5rem', fontWeight: 'bold', color: '#E60000', paddingBottom: '15px' },
  noImage: {
      width: '80px', height: '80px', border: '1px dashed #ccc', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '0.6rem', color: '#999', fontWeight: 'bold'
  },
  noFile: { fontSize: '0.7rem', color: '#999', fontStyle: 'italic' },
  
  divider: { height: '1px', background: '#ccc', width: '100%' },

  saveBtn: {
    marginTop: '20px', padding: '15px', 
    backgroundColor: '#111', color: '#F1E9DB',        
    border: 'none', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase',
    transition: 'opacity 0.2s'
  },
  progress: {
      fontSize: '0.8rem', color: '#E60000', fontWeight: 'bold', textAlign: 'center'
  }
};

export default EditModal;
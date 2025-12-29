import React, { useEffect, useState, useRef } from 'react';
import EditModal from './EditModal'; 

// ==========================================
// 1. THE UPLOAD MODAL (Unchanged)
// ==========================================
const UploadModal = ({ onClose, onSuccess }) => {
  // --- PLAYER COMPONENT ---
  const SimplePlayer = ({ src }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = (e) => {
      e.preventDefault();
      if (!audioRef.current) return;
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };

    return (
      <div style={styles.playerContainer}>
        <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
        <button onClick={togglePlay} style={styles.playerBtn}>{isPlaying ? '||' : '▶'}</button>
        <div style={styles.playerTrack}>
          <div style={{ ...styles.playerBar, width: `${progress}%` }}></div>
        </div>
        <div style={styles.playerMeta}>PREVIEW</div>
      </div>
    );
  };

  // --- FORM LOGIC ---
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', audioFile: null, coverFile: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Previews
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

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
      if (name === 'audioFile') setAudioPreview(URL.createObjectURL(file));
      if (name === 'coverFile') setCoverPreview(URL.createObjectURL(file));
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
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
      }
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(`Upload failed`));
      xhr.onerror = () => reject('Network error');
      xhr.send(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.audioFile || !formData.coverFile) return alert("MISSING FILES");
    setLoading(true);

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

      setIsSuccess(true);
      onSuccess();
      setTimeout(() => onClose(), 2000);

    } catch (error) {
      alert(`ERROR: ${error.message}`);
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
                <h2 style={styles.successTitle}>TRANSMISSION COMPLETE</h2>
                <p style={styles.successSub}>MIX ARCHIVED SUCCESSFULLY</p>
            </div>
        ) : (
            <>
                <div style={styles.header}>
                    <h3>INITIALIZE TRANSMISSION</h3>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.group}>
                        <label style={styles.label}>TRACK TITLE</label>
                        <input name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.group}>
                        <label style={styles.label}>GENRE</label>
                        <input name="genre" value={formData.genre} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.group}>
                        <label style={styles.label}>DESCRIPTION</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} style={styles.textarea} rows="2" />
                    </div>

                    <div style={styles.fileSection}>
                        <div style={styles.group}>
                            <label style={styles.label}>AUDIO (MP3/WAV)</label>
                            {audioPreview && <SimplePlayer src={audioPreview} />}
                            <input type="file" name="audioFile" accept="audio/*" onChange={handleChange} style={styles.fileInput} />
                        </div>
                        <div style={styles.divider}></div>
                        <div style={styles.group}>
                            <label style={styles.label}>COVER (IMG)</label>
                            {coverPreview && (
                                <div style={{ marginBottom: '10px' }}>
                                    <img src={coverPreview} style={styles.imagePreview} alt="Preview" />
                                </div>
                            )}
                            <input type="file" name="coverFile" accept="image/*" onChange={handleChange} style={styles.fileInput} />
                        </div>
                    </div>

                    {loading && <div style={styles.progress}>UPLOADING... {uploadProgress}%</div>}

                    <button type="submit" disabled={loading} style={styles.saveBtn}>
                        {loading ? 'PROCESSING...' : 'INITIATE UPLOAD'}
                    </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN MUSIC LIST COMPONENT
// ==========================================
const Toast = ({ message, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return <div className="toast-notification"><span style={{ color: '#E60000' }}>●</span> {message}</div>;
};

const MusicList = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); 
  const [editingTrack, setEditingTrack] = useState(null); 
  const [showUpload, setShowUpload] = useState(false);
  
  const [toastMsg, setToastMsg] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTracks = async () => {
    try {
        const response = await fetch('https://djkace-api.elaanyu.workers.dev');
        const data = await response.json();
        setTracks(data);
    } catch (e) {
        console.error(e);
        setToastMsg("ERROR: CONNECTION FAILED");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchTracks(); }, []);

  const handleDeleteClick = (id) => {
      if (deleteConfirmId === id) executeDelete(id);
      else { setDeleteConfirmId(id); setTimeout(() => setDeleteConfirmId(null), 3000); }
  };

  const executeDelete = async (id) => {
    setProcessing(id);
    setDeleteConfirmId(null);
    try {
        const res = await fetch(`https://djkace-api.elaanyu.workers.dev?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
        setTracks(tracks.filter(t => t.id !== id));
        setToastMsg("SYSTEM: RECORD ERASED");
    } catch (error) {
        setToastMsg("ERROR: DELETION FAILED");
    } finally {
        setProcessing(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontFamily: 'monospace' }}>LOADING DATABASE...</div>;

  return (
    <>
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>AUDIO ARCHIVE</h2>
            <button onClick={() => setShowUpload(true)} style={styles.addBtn}>+ UPLOAD NEW MIX</button>
        </div>

        <div className="list-container">
        {tracks.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.5 }}>ARCHIVE EMPTY</div>
        ) : (
            tracks.map((track, index) => (
                <div key={track.id} className="track-row">
                    <div className="track-left">
                        <div className="track-index">{index + 1 < 10 ? `0${index + 1}` : index + 1}</div>
                        <div className="cover-wrapper">
                            {track.image_url ? (
                                <img src={track.image_url} alt={track.title} className="cover-image" onError={(e) => {e.target.style.display='none'}} />
                            ) : <div className="no-cover">NO IMG</div>}
                        </div>
                    </div>
                    
                    <div className="track-info">
                        <div className="track-title">{track.title}</div>
                        <div className="track-meta">{track.genre}</div>
                    </div>

                    {/* --- UPDATED STATS SECTION --- */}
                    <div className="track-stats">
                        <div className="stat-item">
                            <span className="stat-label">PLAYS:</span> {track.play_count || 0}
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">DOWNLOADS:</span> {track.download_count || 0}
                        </div>
                    </div>

                    <div className="track-actions">
                        <button className="btn-edit" onClick={() => setEditingTrack(track)}>EDIT</button>
                        <button 
                            className={deleteConfirmId === track.id ? "btn-delete-confirm" : "btn-delete"}
                            onClick={() => handleDeleteClick(track.id)}
                            disabled={processing === track.id}
                        >
                            {processing === track.id ? '...' : deleteConfirmId === track.id ? 'CONFIRM?' : 'DELETE'}
                        </button>
                    </div>
                </div>
            ))
        )}
        </div>

        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

        {/* --- MODALS --- */}
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchTracks} />}
        {editingTrack && (
            <EditModal 
                track={editingTrack} 
                onClose={() => setEditingTrack(null)} 
                onSave={() => { fetchTracks(); setEditingTrack(null); setToastMsg("SYSTEM: DATABASE UPDATED"); }} 
            />
        )}

        {/* --- CSS INJECTION --- */}
        <style>{`
            .list-container { display: flex; flex-direction: column; gap: 15px; border-top: 2px solid #111; padding-top: 20px; padding-bottom: 80px; }
            .track-row { display: flex; alignItems: center; padding: 15px; border: 1px solid #ddd; background-color: #fff; box-shadow: 2px 2px 0px rgba(0,0,0,0.05); gap: 20px; }
            .track-left { display: flex; alignItems: center; gap: 15px; }
            .track-index { font-weight: bold; color: #E60000; font-size: 0.9rem; font-family: 'Space Mono', monospace; min-width: 25px; }
            .cover-wrapper { width: 50px; height: 50px; overflow: hidden; border: 1px solid #ccc; background-color: #f0f0f0; display: flex; alignItems: center; justify-content: center; flex-shrink: 0; }
            .cover-image { width: 100%; height: 100%; object-fit: cover; }
            .no-cover { font-size: 0.5rem; color: #999; font-weight: bold; }
            .track-info { flex: 1; min-width: 0; }
            .track-title { font-weight: 900; font-size: 1rem; text-transform: uppercase; color: #111; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .track-meta { font-size: 0.75rem; color: #666; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            
            /* STATS STYLES UPDATED */
            .track-stats { display: flex; gap: 15px; align-items: center; margin-right: 15px; border-right: 1px solid #eee; padding-right: 15px; }
            .stat-item { font-family: 'Space Mono', monospace; font-size: 0.8rem; font-weight: bold; color: #555; display: flex; alignItems: center; gap: 5px; }
            .stat-label { font-size: 0.7rem; color: #E60000; letter-spacing: 1px; }

            .track-actions { display: flex; gap: 10px; }
            button { font-family: 'Space Mono', monospace; cursor: pointer; transition: opacity 0.2s; }
            .btn-edit { background: #111; color: #F1E9DB; border: none; font-size: 0.75rem; padding: 8px 16px; font-weight: bold; letter-spacing: 1px; }
            .btn-delete { background: #E60000; color: #fff; border: none; font-size: 0.75rem; padding: 8px 16px; font-weight: bold; letter-spacing: 1px; }
            .btn-delete-confirm { background: #000; color: #E60000; border: 2px solid #E60000; font-size: 0.75rem; padding: 6px 14px; font-weight: bold; letter-spacing: 1px; animation: pulse 1s infinite; }
            .toast-notification { position: fixed; bottom: 20px; right: 20px; background-color: #111; color: #F1E9DB; padding: 15px 25px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 0.8rem; font-weight: bold; letter-spacing: 1px; display: flex; alignItems: center; gap: 10px; z-index: 2000; animation: slideUp 0.3s ease-out; }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            @media (max-width: 768px) {
                .track-row { flex-direction: column; alignItems: flex-start; gap: 15px; padding: 20px; position: relative; }
                .track-left, .track-info { width: 100%; }
                
                /* Mobile Stats */
                .track-stats { 
                    width: 100%; 
                    justify-content: flex-start; 
                    margin: 0; 
                    padding: 10px 0; 
                    border-top: 1px solid #eee; 
                    border-right: none; 
                    border-bottom: 1px solid #eee;
                }
                
                .track-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px; }
                .btn-edit, .btn-delete, .btn-delete-confirm { width: 100%; padding: 12px 0; font-size: 0.85rem; text-align: center; }
            }
        `}</style>
    </>
  );
};

// --- STYLES OBJECT (For Modal Only) ---
const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', maxWidth: '500px', backgroundColor: '#F1E9DB', border: '3px solid #111', padding: '30px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: '300px' },
  
  // Header & Buttons
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #111', paddingBottom: '10px', color: '#111' },
  closeBtn: { background: 'none', border: 'none', fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer', color: '#111' },
  addBtn: { backgroundColor: '#E60000', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace' },
  saveBtn: { marginTop: '20px', padding: '15px', backgroundColor: '#111', color: '#F1E9DB', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', transition: 'opacity 0.2s' },

  // Form Layout
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  group: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.7rem', fontWeight: 'bold', color: '#666', letterSpacing: '1px' },
  input: { background: 'transparent', border: 'none', borderBottom: '2px solid #111', padding: '8px 0', fontSize: '1rem', fontFamily: 'monospace', width: '100%', color: '#111', outline: 'none' },
  textarea: { background: '#fff', border: '2px solid #111', padding: '10px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#111', outline: 'none' },
  
  // File Section
  fileSection: { border: '2px dashed #666', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px', backgroundColor: 'rgba(255,255,255,0.5)' },
  fileInput: { fontSize: '0.85rem', color: '#111', cursor: 'pointer', marginTop: '5px' },
  divider: { height: '1px', background: '#ccc', width: '100%' },
  
  // Previews
  imagePreview: { width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #111', boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' },
  playerContainer: { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #111', padding: '8px', backgroundColor: '#fff', width: '100%', fontFamily: '"Space Mono", monospace', boxSizing: 'border-box' },
  playerBtn: { background: '#111', color: '#F1E9DB', border: 'none', padding: '5px 8px', fontSize: '0.6rem', fontWeight: 'bold', cursor: 'pointer', minWidth: '30px' },
  playerTrack: { flex: 1, height: '6px', background: '#eee', border: '1px solid #111', position: 'relative' },
  playerBar: { height: '100%', background: '#E60000', transition: 'width 0.1s linear' },
  playerMeta: { fontSize: '0.5rem', color: '#999', letterSpacing: '1px' },

  // Success
  successContainer: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px', animation: 'fadeIn 0.5s ease' },
  tickCircle: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' },
  tickSvg: { width: '40px', height: '40px', color: '#F1E9DB' },
  successTitle: { fontSize: '1.5rem', fontWeight: '900', textAlign: 'center', margin: 0, letterSpacing: '1px' },
  successSub: { fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold', margin: 0, letterSpacing: '2px' },
  progress: { fontSize: '0.8rem', color: '#E60000', fontWeight: 'bold', textAlign: 'center' }
};

export default MusicList;
import React, { useState } from 'react';

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
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

      alert('SUCCESS: TRACK INDEXED IN ARCHIVE.');
      setFormData({ title: '', description: '', genre: '', audioFile: null, coverFile: null });
      e.target.reset();
    } catch (error) {
      console.error(error);
      alert(`ERROR: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      
      {/* TEXT INPUTS */}
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

      {/* FILE INPUTS */}
      <div style={styles.fileGroup}>
        <div style={styles.group}>
            <label style={styles.label}>AUDIO SOURCE (MP3/WAV)</label>
            <input type="file" name="audioFile" accept="audio/*" onChange={handleChange} required style={styles.fileInput} />
        </div>
        
        <div style={styles.group}>
            <label style={styles.label}>COVER ART (JPG/PNG)</label>
            <input type="file" name="coverFile" accept="image/*" onChange={handleChange} required style={styles.fileInput} />
        </div>
      </div>

      {/* PROGRESS BAR */}
      {loading && (
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

      {/* SUBMIT BUTTON */}
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
    padding: '10px 0',
    cursor: 'pointer',
  },

  fileGroup: {
      border: '1px dashed #ccc',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
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

  progressContainer: {
      marginTop: '10px',
  },
  progressMeta: {
      display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px'
  },
  progressBarBg: {
      width: '100%', height: '10px', background: '#ccc',
  },
  progressBarFill: {
      height: '100%', background: '#E60000', transition: 'width 0.2s ease'
  }
};

export default UploadForm;
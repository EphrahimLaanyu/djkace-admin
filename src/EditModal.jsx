import React, { useState } from 'react';

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

      alert("UPDATE SUCCESSFUL");
      onSave(); 
      onClose(); 

    } catch (error) {
      console.error(error);
      alert(`Update Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h3>EDIT RECORD: {track.id}</h3>
            <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
            {/* TEXT FIELDS */}
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

            {/* FILE REPLACEMENTS */}
            <div style={styles.fileSection}>
                <div style={styles.group}>
                    <label style={styles.label}>REPLACE AUDIO (Optional)</label>
                    <input type="file" name="audioFile" accept="audio/*" onChange={handleChange} style={styles.fileInput} />
                </div>
                <div style={styles.group}>
                    <label style={styles.label}>REPLACE COVER (Optional)</label>
                    <input type="file" name="coverFile" accept="image/*" onChange={handleChange} style={styles.fileInput} />
                </div>
            </div>

            {/* STATUS */}
            {loading && (
                <div style={styles.progress}>
                    UPLOADING CHANGES... {formData.audioFile ? `${progress}%` : ''}
                </div>
            )}

            <button type="submit" disabled={loading} style={styles.saveBtn}>
                {loading ? 'PROCESSING...' : 'SAVE CHANGES'}
            </button>
        </form>
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
    width: '90%', maxWidth: '500px', backgroundColor: '#F1E9DB', // Beige Background
    border: '3px solid #111', padding: '30px', position: 'relative',
    boxShadow: '10px 10px 0px rgba(0,0,0,0.5)' // Drop shadow for visibility
  },
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
    border: '2px dashed #666', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px',
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  fileInput: { fontSize: '0.85rem', color: '#111', cursor: 'pointer' },
  saveBtn: {
    marginTop: '20px', padding: '15px', 
    backgroundColor: '#111', // Black Button
    color: '#F1E9DB',        // Beige Text
    border: 'none', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase',
    transition: 'opacity 0.2s'
  },
  progress: {
      fontSize: '0.8rem', color: '#E60000', fontWeight: 'bold', textAlign: 'center'
  }
};

export default EditModal;
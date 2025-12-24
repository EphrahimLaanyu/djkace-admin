import React, { useEffect, useState } from 'react';
import EditModal from './EditModal'; // Import the new modal

const MusicList = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // ID for deleting
  const [editingTrack, setEditingTrack] = useState(null); // Track object for editing

  // --- FETCH ---
  const fetchTracks = async () => {
    try {
        const response = await fetch('https://djkace-api.elaanyu.workers.dev');
        const data = await response.json();
        setTracks(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("ARE YOU SURE? This cannot be undone.")) return;
    setProcessing(id);

    try {
        const res = await fetch(`https://djkace-api.elaanyu.workers.dev?id=${id}`, {
            method: 'DELETE',
        });
        
        if (!res.ok) throw new Error("Delete failed");
        
        setTracks(tracks.filter(t => t.id !== id));
        alert("RECORD DELETED.");
    } catch (error) {
        console.error(error);
        alert("Error deleting track.");
    } finally {
        setProcessing(null);
    }
  };

  if (loading) return <div style={styles.status}>LOADING DATABASE...</div>;

  return (
    <>
        <div style={styles.listContainer}>
        {tracks.length === 0 ? (
            <div style={styles.status}>ARCHIVE EMPTY</div>
        ) : (
            tracks.map((track, index) => (
                <div key={track.id} style={styles.row}>
                    <div style={styles.index}>
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                    
                    <div style={styles.info}>
                        <div style={styles.title}>{track.title}</div>
                        <div style={styles.meta}>
                            {track.genre} // {track.description ? track.description.substring(0, 20) + '...' : 'NO DESC'}
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button 
                            style={styles.editBtn} 
                            onClick={() => setEditingTrack(track)} // Open Modal
                        >
                            EDIT
                        </button>
                        <button 
                            style={styles.deleteBtn} 
                            onClick={() => handleDelete(track.id)}
                            disabled={processing === track.id}
                        >
                            {processing === track.id ? '...' : 'DELETE'}
                        </button>
                    </div>
                </div>
            ))
        )}
        </div>

        {/* RENDER MODAL IF EDITING */}
        {editingTrack && (
            <EditModal 
                track={editingTrack} 
                onClose={() => setEditingTrack(null)} 
                onSave={() => {
                    fetchTracks(); // Refresh list after save
                    setEditingTrack(null);
                }} 
            />
        )}
    </>
  );
};

const styles = {
  listContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      borderTop: '2px solid #111',
      paddingTop: '20px'
  },
  status: {
      textAlign: 'center',
      fontSize: '0.8rem',
      opacity: 0.5,
      padding: '20px'
  },
  row: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px 15px',
      border: '1px solid #ddd', // Subtle border
      gap: '15px',
      backgroundColor: '#fff', // White card background
      boxShadow: '2px 2px 0px rgba(0,0,0,0.1)' // Small shadow for pop
  },
  index: {
      fontWeight: 'bold',
      color: '#E60000',
      width: '30px',
      fontSize: '0.9rem'
  },
  info: {
      flex: 1,
  },
  title: {
      fontWeight: '900',
      fontSize: '1rem',
      textTransform: 'uppercase',
      color: '#111'
  },
  meta: {
      fontSize: '0.75rem',
      color: '#666',
      marginTop: '4px',
      fontFamily: 'monospace'
  },
  actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
  },
  editBtn: {
      background: '#111', // Solid Black
      color: '#F1E9DB',   // Beige Text
      border: 'none',
      fontSize: '0.75rem',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: 'bold',
      letterSpacing: '1px',
      transition: 'opacity 0.2s'
  },
  deleteBtn: {
      backgroundColor: '#E60000', // Solid Red
      color: '#fff',              // White Text
      border: 'none',
      fontSize: '0.75rem',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: 'bold',
      letterSpacing: '1px',
      transition: 'opacity 0.2s'
  }
};

export default MusicList;
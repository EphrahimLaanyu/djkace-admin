import React, { useEffect, useState } from 'react';
import EditModal from './EditModal'; 

// --- TOAST COMPONENT ---
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-notification">
      <span style={{ color: '#E60000' }}>●</span> {message}
    </div>
  );
};

// --- MAIN COMPONENT ---
const MusicList = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); 
  const [editingTrack, setEditingTrack] = useState(null); 
  
  const [toastMsg, setToastMsg] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const showToast = (msg) => setToastMsg(msg);

  // --- FETCH ---
  const fetchTracks = async () => {
    try {
        const response = await fetch('https://djkace-api.elaanyu.workers.dev');
        const data = await response.json();
        setTracks(data);
    } catch (e) {
        console.error(e);
        showToast("ERROR: CONNECTION FAILED");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDeleteClick = (id) => {
      if (deleteConfirmId === id) {
          executeDelete(id);
      } else {
          setDeleteConfirmId(id);
          setTimeout(() => setDeleteConfirmId(null), 3000);
      }
  };

  const executeDelete = async (id) => {
    setProcessing(id);
    setDeleteConfirmId(null);

    try {
        const res = await fetch(`https://djkace-api.elaanyu.workers.dev?id=${id}`, {
            method: 'DELETE',
        });
        
        if (!res.ok) throw new Error("Delete failed");
        
        setTracks(tracks.filter(t => t.id !== id));
        showToast("SYSTEM: RECORD ERASED");
    } catch (error) {
        console.error(error);
        showToast("ERROR: DELETION FAILED");
    } finally {
        setProcessing(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontFamily: 'monospace' }}>LOADING DATABASE...</div>;

  return (
    <>
        <div className="list-container">
        {tracks.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.5 }}>ARCHIVE EMPTY</div>
        ) : (
            tracks.map((track, index) => (
                <div key={track.id} className="track-row">
                    
                    {/* LEFT GROUP: INDEX + IMAGE */}
                    <div className="track-left">
                        <div className="track-index">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                        </div>

                        <div className="cover-wrapper">
                            {track.image_url ? (
                                <img 
                                    src={track.image_url} 
                                    alt={track.title} 
                                    className="cover-image"
                                    onError={(e) => {e.target.style.display='none'}} 
                                />
                            ) : (
                                <div className="no-cover">NO IMG</div>
                            )}
                        </div>
                    </div>
                    
                    {/* MIDDLE: INFO */}
                    <div className="track-info">
                        <div className="track-title">{track.title}</div>
                        <div className="track-meta">
                            {track.genre} // {track.description ? track.description.substring(0, 30) + (track.description.length > 30 ? '...' : '') : 'NO DESC'}
                        </div>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div className="track-actions">
                        <button 
                            className="btn-edit"
                            onClick={() => setEditingTrack(track)} 
                        >
                            EDIT
                        </button>
                        
                        <button 
                            className={deleteConfirmId === track.id ? "btn-delete-confirm" : "btn-delete"}
                            onClick={() => handleDeleteClick(track.id)}
                            disabled={processing === track.id}
                        >
                            {processing === track.id ? '...' : 
                             deleteConfirmId === track.id ? 'CONFIRM?' : 'DELETE'}
                        </button>
                    </div>
                </div>
            ))
        )}
        </div>

        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

        {editingTrack && (
            <EditModal 
                track={editingTrack} 
                onClose={() => setEditingTrack(null)} 
                onSave={() => {
                    fetchTracks(); 
                    setEditingTrack(null);
                    showToast("SYSTEM: DATABASE UPDATED");
                }} 
            />
        )}

        {/* --- CSS STYLES --- */}
        <style>{`
            .list-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
                border-top: 2px solid #111;
                padding-top: 20px;
                padding-bottom: 80px;
            }

            .track-row {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 1px solid #ddd;
                background-color: #fff;
                box-shadow: 2px 2px 0px rgba(0,0,0,0.05);
                gap: 20px;
            }

            /* LEFT GROUP */
            .track-left {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .track-index {
                font-weight: bold;
                color: #E60000;
                font-size: 0.9rem;
                font-family: 'Space Mono', monospace;
                min-width: 25px;
            }

            .cover-wrapper {
                width: 50px;
                height: 50px;
                overflow: hidden;
                border: 1px solid #ccc;
                background-color: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .cover-image { width: 100%; height: 100%; object-fit: cover; }
            .no-cover { font-size: 0.5rem; color: #999; font-weight: bold; }

            /* INFO */
            .track-info {
                flex: 1;
                min-width: 0; /* Enables text truncation */
            }

            .track-title {
                font-weight: 900;
                font-size: 1rem;
                text-transform: uppercase;
                color: #111;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .track-meta {
                font-size: 0.75rem;
                color: #666;
                font-family: monospace;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* ACTIONS */
            .track-actions {
                display: flex;
                gap: 10px;
            }

            button {
                font-family: 'Space Mono', monospace;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .btn-edit {
                background: #111;
                color: #F1E9DB;
                border: none;
                font-size: 0.75rem;
                padding: 8px 16px;
                font-weight: bold;
                letter-spacing: 1px;
            }

            .btn-delete {
                background: #E60000;
                color: #fff;
                border: none;
                font-size: 0.75rem;
                padding: 8px 16px;
                font-weight: bold;
                letter-spacing: 1px;
            }

            .btn-delete-confirm {
                background: #000;
                color: #E60000;
                border: 2px solid #E60000;
                font-size: 0.75rem;
                padding: 6px 14px;
                font-weight: bold;
                letter-spacing: 1px;
                animation: pulse 1s infinite;
            }

            /* TOAST */
            .toast-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #111;
                color: #F1E9DB;
                padding: 15px 25px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-size: 0.8rem;
                font-weight: bold;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 2000;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

            /* --- MOBILE RESPONSIVENESS (Max Width 768px) --- */
            @media (max-width: 768px) {
                .track-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                    padding: 20px;
                }

                .track-left {
                    width: 100%;
                }

                .cover-wrapper {
                    width: 60px;
                    height: 60px;
                }

                .track-info {
                    width: 100%;
                }

                .track-title {
                    font-size: 1.1rem;
                    white-space: normal; /* Allow wrapping on mobile */
                }

                .track-meta {
                    white-space: normal;
                }

                .track-actions {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr; /* Buttons side-by-side full width */
                    gap: 10px;
                    margin-top: 5px;
                }

                .btn-edit, .btn-delete, .btn-delete-confirm {
                    width: 100%;
                    padding: 12px 0; /* Taller buttons for easy tapping */
                    font-size: 0.85rem;
                    text-align: center;
                }

                .toast-notification {
                    left: 20px;
                    right: 20px;
                    text-align: center;
                    justify-content: center;
                }
            }
        `}</style>
    </>
  );
};

export default MusicList;
import React, { useEffect, useState } from 'react';

// --- HELPER: EXTRACT YOUTUBE ID ---
const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// --- ADD VIDEO FORM ---
const AddVideoForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({ title: '', link: '' });
    const [loading, setLoading] = useState(false);
    const [previewId, setPreviewId] = useState(null);

    useEffect(() => {
        const id = getYouTubeId(formData.link);
        setPreviewId(id);
    }, [formData.link]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('https://djkace-api.elaanyu.workers.dev/youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Failed");
            
            setFormData({ title: '', link: '' }); 
            setPreviewId(null);
            onSuccess(); 
        } catch (error) {
            alert("Error adding video");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="yt-form">
            <div className="yt-row">
                <input 
                    placeholder="VIDEO TITLE" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="yt-input"
                    required 
                />
                <input 
                    placeholder="YOUTUBE LINK (e.g. https://youtu.be/...)" 
                    value={formData.link} 
                    onChange={e => setFormData({...formData, link: e.target.value})} 
                    className="yt-input"
                    required 
                />
                <button type="submit" disabled={loading} className="yt-add-btn">
                    {loading ? 'ADDING...' : '+ ADD VIDEO'}
                </button>
            </div>

            {/* LIVE PREVIEW */}
            {previewId && (
                <div style={ytStyles.previewContainer}>
                    <div style={ytStyles.previewLabel}>LIVE PREVIEW:</div>
                    <div style={ytStyles.embedWrapper}>
                        <iframe 
                            src={`https://www.youtube-nocookie.com/embed/${previewId}`} 
                            title="Preview" 
                            style={ytStyles.iframe}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </form>
    );
};

// --- MAIN MANAGER COMPONENT ---
const YouTubeManager = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = async () => {
        try {
            const res = await fetch('https://djkace-api.elaanyu.workers.dev/youtube');
            const data = await res.json();
            setVideos(data);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVideos(); }, []);

    const deleteVideo = async (id) => {
        if(!window.confirm("Delete this video?")) return;
        await fetch(`https://djkace-api.elaanyu.workers.dev/youtube?id=${id}`, { method: 'DELETE' });
        setVideos(videos.filter(v => v.id !== id));
    };

    return (
        <div>
            {/* CSS INJECTION FOR RESPONSIVENESS */}
            <style>{`
                .yt-form { display: flex; flex-direction: column; gap: 15px; }
                .yt-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
                .yt-input { flex: 1; padding: 12px; border: 1px solid #ccc; font-family: monospace; font-size: 1rem; min-width: 200px; }
                .yt-add-btn { padding: 12px 25px; background: #111; color: #fff; border: none; cursor: pointer; font-weight: bold; font-size: 0.9rem; white-space: nowrap; }
                
                .yt-card { display: flex; gap: 20px; align-items: flex-start; background: #fff; padding: 20px; border: 1px solid #ddd; box-shadow: 2px 2px 0 rgba(0,0,0,0.05); }
                .yt-thumb-wrapper { width: 160px; aspect-ratio: 16/9; position: relative; background-color: #000; flex-shrink: 0; overflow: hidden; border: 1px solid #ccc; }
                .yt-info { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
                .yt-delete-btn { background: transparent; color: #E60000; border: 2px solid #E60000; padding: 10px 15px; cursor: pointer; font-weight: bold; font-size: 0.8rem; align-self: center; margin-left: auto; }

                /* MOBILE RESPONSIVE RULES */
                @media (max-width: 768px) {
                    .yt-row { flex-direction: column; align-items: stretch; }
                    .yt-input { min-width: 0; width: 100%; box-sizing: border-box; }
                    .yt-add-btn { width: 100%; }
                    
                    .yt-card { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .yt-thumb-wrapper { width: 100%; max-width: none; }
                    .yt-info { width: 100%; }
                    .yt-delete-btn { width: 100%; margin-left: 0; text-align: center; margin-top: 10px; }
                }
            `}</style>

            <h2 style={{ borderBottom: '2px solid #111', paddingBottom: '10px' }}>YOUTUBE ARCHIVE</h2>
            
            <div style={{ marginBottom: '40px', padding: '20px', background: '#fff', border: '1px solid #ccc' }}>
                <AddVideoForm onSuccess={fetchVideos} />
            </div>

            {loading ? <div>LOADING ARCHIVE...</div> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {videos.map(video => {
                        const videoId = getYouTubeId(video.link);
                        const thumbUrl = videoId 
                            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` 
                            : null;

                        return (
                            <div key={video.id} className="yt-card">
                                {/* THUMBNAIL */}
                                <div className="yt-thumb-wrapper">
                                    {thumbUrl ? (
                                        <a href={video.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                                            <img 
                                                src={thumbUrl} 
                                                alt={video.title} 
                                                style={ytStyles.thumbnail} 
                                            />
                                            <div style={ytStyles.playOverlay}>▶</div>
                                        </a>
                                    ) : (
                                        <div style={ytStyles.noVideo}>INVALID LINK</div>
                                    )}
                                </div>
                                
                                <div className="yt-info">
                                    <div style={ytStyles.title}>{video.title}</div>
                                    <a href={video.link} target="_blank" rel="noreferrer" style={ytStyles.link}>
                                        {video.link}
                                    </a>
                                </div>
                                
                                <button onClick={() => deleteVideo(video.id)} className="yt-delete-btn">
                                    DELETE
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ytStyles = {
    // Preview Styles (Kept inline as they are conditionally rendered)
    previewContainer: { padding: '15px', background: '#f4f4f4', border: '1px dashed #ccc', marginTop: '15px' },
    previewLabel: { fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '10px', color: '#E60000', letterSpacing: '1px' },
    embedWrapper: { position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '16/9', backgroundColor: '#000' },
    iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    
    // Thumbnail specific styles
    thumbnail: { width: '100%', height: '100%', objectFit: 'cover' },
    playOverlay: { 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontSize: '2rem', color: 'rgba(255,255,255,0.8)', pointerEvents: 'none' 
    },
    noVideo: { 
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', color: '#fff', fontSize: '0.7rem' 
    },
    
    title: { fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase', lineHeight: '1.2' },
    link: { fontSize: '0.8rem', color: '#666', textDecoration: 'underline', fontFamily: 'monospace', wordBreak: 'break-all' }
};

export default YouTubeManager;
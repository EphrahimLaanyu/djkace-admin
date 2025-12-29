import React, { useEffect, useState } from 'react';

const MessagesList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch('https://djkace-api.elaanyu.workers.dev/messages');
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    // Optimistic UI update
    setMessages(messages.map(m => m.id === id ? {...m, is_read: 1} : m));
    await fetch('https://djkace-api.elaanyu.workers.dev/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
  };

  const deleteMessage = async (id) => {
    if(!window.confirm("DELETE MESSAGE?")) return;
    setMessages(messages.filter(m => m.id !== id));
    await fetch(`https://djkace-api.elaanyu.workers.dev/messages?id=${id}`, { method: 'DELETE' });
  };

  if (loading) return <div style={{textAlign: 'center', fontFamily: 'monospace'}}>CHECKING INBOX...</div>;

  return (
    <div style={styles.container}>
      {messages.length === 0 ? (
          <div style={{textAlign: 'center', opacity: 0.5}}>NO NEW TRANSMISSIONS</div>
      ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{
                ...styles.card,
                // Distinct styling: Unread is White/Red, Read is Grey/Dim
                backgroundColor: msg.is_read ? '#f4f4f4' : '#fff',
                opacity: msg.is_read ? 0.7 : 1,
                borderLeft: msg.is_read ? '5px solid #ccc' : '5px solid #E60000'
            }}>
                {/* HEADER (DATE) */}
                <div style={styles.header}>
                    <span style={styles.statusBadge}>
                        {msg.is_read ? "READ" : "● NEW MESSAGE"}
                    </span>
                    <span style={styles.date}>{new Date(msg.created_at).toLocaleString()}</span>
                </div>

                <div style={styles.contentRow}>
                    <span style={styles.label}>NAME:</span>
                    <span style={styles.value}>{msg.name}</span>
                </div>
                
                <div style={styles.contentRow}>
                    <span style={styles.label}>EMAIL:</span>
                    <span style={styles.value}>{msg.email}</span>
                </div>
                
                {/* MESSAGE BODY */}
                <div style={styles.messageBlock}>
                    <span style={styles.label}>MESSAGE:</span>
                    <div style={styles.bodyText}>{msg.message}</div>
                </div>

                {/* ACTIONS */}
                <div style={styles.actions}>
                    {!msg.is_read && (
                        <button onClick={() => markAsRead(msg.id)} style={styles.readBtn}>
                            ✓ MARK AS READ
                        </button>
                    )}
                    <button onClick={() => deleteMessage(msg.id)} style={styles.deleteBtn}>
                        DELETE
                    </button>
                </div>
            </div>
          ))
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' },
  card: {
      border: '1px solid #ddd', padding: '25px',
      boxShadow: '4px 4px 0 rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '15px',
      transition: 'all 0.2s ease'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
  statusBadge: { fontSize: '0.7rem', fontWeight: '900', color: '#E60000', letterSpacing: '1px' },
  date: { fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' },
  
  contentRow: { display: 'flex', flexDirection: 'column', gap: '2px' },
  label: { fontSize: '0.65rem', fontWeight: 'bold', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' },
  value: { fontSize: '1rem', fontWeight: 'bold', color: '#111', fontFamily: '"Space Mono", monospace' },
  
  messageBlock: { marginTop: '10px' },
  bodyText: { 
      fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#333', 
      backgroundColor: 'rgba(0,0,0,0.03)', padding: '15px', marginTop: '5px', borderRadius: '4px' 
  },

  actions: { display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' },
  readBtn: {
      background: '#111', color: '#fff', border: 'none', padding: '10px 15px',
      fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px'
  },
  deleteBtn: {
      background: 'transparent', color: '#E60000', border: '1px solid #E60000', padding: '10px 15px',
      fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px'
  }
};

export default MessagesList;
import { useState } from 'react';

const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Clothes: '#4ECDC4',
  Grocery: '#45B7D1',
  Protein: '#96CEB4',
  Other: '#FFEAA7',
};

export default function MessageBubble({ msg, onOptionSelect, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // History expense bubble
  if (msg.from === 'history') {
    const e = msg.expense;
    const color = CATEGORY_COLORS[e.category] || '#ddd';
    return (
      <div style={styles.historyBubble}>
        <div style={{ ...styles.categoryDot, background: color }} />
        <div style={styles.historyContent}>
          <span style={styles.historyCategory}>{e.category}</span>
          {e.note && <span style={styles.historyNote}>{e.note}</span>}
          <span style={styles.historyDate}>{new Date(e.date).toLocaleDateString()}</span>
        </div>
        <span style={styles.historyAmount}>₹{e.amount}</span>
        {!confirmDelete ? (
          <button style={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>🗑️</button>
        ) : (
          <div style={styles.confirmRow}>
            <button style={styles.confirmYes} onClick={() => onDelete(e._id)}>Yes</button>
            <button style={styles.confirmNo} onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        )}
      </div>
    );
  }

  // Bot message
  if (msg.from === 'bot') {
    return (
      <div style={styles.botRow}>
        <div style={styles.botAvatar}>🤖</div>
        <div style={styles.botBubble}>
          <p style={styles.botText}>{msg.text}</p>
          {msg.options && (
            <div style={styles.options}>
              {msg.options.map((opt) => (
                <button
                  key={opt}
                  style={styles.optionBtn}
                  onClick={() => onOptionSelect && onOptionSelect(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User message
  return (
    <div style={styles.userRow}>
      <div style={styles.userBubble}>
        <p style={styles.userText}>{msg.text}</p>
      </div>
    </div>
  );
}

const styles = {
  // History expense
  historyBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: '#fff',
    borderRadius: '1rem',
    padding: '0.6rem 0.75rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  categoryDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  historyContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  historyCategory: {
    fontWeight: 600,
    fontSize: '0.85rem',
    color: '#333',
  },
  historyNote: {
    fontSize: '0.75rem',
    color: '#888',
  },
  historyDate: {
    fontSize: '0.7rem',
    color: '#bbb',
  },
  historyAmount: {
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#333',
    flexShrink: 0,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0 0.2rem',
    opacity: 0.5,
  },
  confirmRow: {
    display: 'flex',
    gap: '0.3rem',
  },
  confirmYes: {
    background: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.2rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  confirmNo: {
    background: '#eee',
    color: '#333',
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.2rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },

  // Bot message
  botRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  botAvatar: {
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  botBubble: {
    background: '#fff',
    borderRadius: '1rem 1rem 1rem 0',
    padding: '0.65rem 0.9rem',
    maxWidth: '75%',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  botText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#333',
    lineHeight: 1.5,
    whiteSpace: 'pre-line',
  },
  options: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  optionBtn: {
    background: '#f0eeff',
    color: '#6c63ff',
    border: '1px solid #c5bfff',
    borderRadius: '2rem',
    padding: '0.35rem 0.8rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },

  // User message
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userBubble: {
    background: '#6c63ff',
    borderRadius: '1rem 1rem 0 1rem',
    padding: '0.65rem 0.9rem',
    maxWidth: '70%',
  },
  userText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#fff',
    lineHeight: 1.5,
  },
};

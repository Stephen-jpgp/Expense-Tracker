import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpenses } from '../../contexts/ExpenseContext';
import MessageBubble from './MessageBubble';

const STEPS = ['amount', 'category', 'note', 'confirm'];

const botMsg = (text, options = null) => ({
  id: Date.now() + Math.random(),
  from: 'bot',
  text,
  options,
});

const userMsg = (text) => ({
  id: Date.now() + Math.random(),
  from: 'user',
  text,
});

export default function ChatView() {
  const { user } = useAuth();
  const { expenses, fetchExpenses, addExpense, deleteExpense, currentMonth } = useExpenses();
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(null); // null = idle
  const [draft, setDraft] = useState({});
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Load expenses and welcome message on mount
  useEffect(() => {
    fetchExpenses(currentMonth);
    setMessages([
      botMsg(`Hey ${user?.name?.split(' ')[0]}! 👋 Tap the + button to log a new expense, or scroll up to see your history.`),
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const startLogging = () => {
    setDraft({});
    setStep('amount');
    addMessage(botMsg('How much did you spend? (enter amount)'));
  };

  const handleOptionSelect = (option) => {
    if (step === 'category') {
      addMessage(userMsg(option));
      setDraft((prev) => ({ ...prev, category: option }));
      setStep('note');
      addMessage(botMsg('Add a note? (optional — tap Skip to skip)'));
    }
  };

  const handleSend = async () => {
    const val = inputVal.trim();
    if (!val && step !== 'note') return;

    setInputVal('');

    if (step === 'amount') {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        addMessage(botMsg('Please enter a valid amount (e.g. 250)'));
        return;
      }
      addMessage(userMsg(`₹${num}`));
      setDraft((prev) => ({ ...prev, amount: num }));
      setStep('category');
      addMessage(
        botMsg('Which category?', user?.categories || ['Food', 'Clothes', 'Grocery', 'Protein', 'Other'])
      );
      return;
    }

    if (step === 'note') {
      const note = val || '';
      addMessage(userMsg(note || 'No note'));
      const finalDraft = { ...draft, note };
      setDraft(finalDraft);
      setStep('confirm');
      addMessage(
        botMsg(
          `Got it! Here's the summary:\n💰 ₹${finalDraft.amount}\n🏷️ ${finalDraft.category}\n📝 ${finalDraft.note || '—'}\n\nConfirm?`,
          ['Yes, save it', 'Cancel']
        )
      );
      return;
    }

    if (step === 'confirm') {
      if (val === 'Yes, save it') {
        addMessage(userMsg('Yes, save it'));
        setLoading(true);
        try {
          await addExpense(draft);
          addMessage(botMsg(`Saved! ₹${draft.amount} on ${draft.category} logged successfully ✅`));
        } catch {
          addMessage(botMsg('Something went wrong. Please try again.'));
        } finally {
          setLoading(false);
          setStep(null);
          setDraft({});
        }
      } else {
        addMessage(userMsg('Cancel'));
        addMessage(botMsg('Cancelled. Tap + to log a new expense anytime.'));
        setStep(null);
        setDraft({});
      }
    }
  };

  const handleSkip = () => {
    if (step === 'note') {
      handleSendWithValue('');
    }
  };

  const handleSendWithValue = async (val) => {
    const note = val || '';
    addMessage(userMsg(note || 'No note'));
    const finalDraft = { ...draft, note };
    setDraft(finalDraft);
    setStep('confirm');
    addMessage(
      botMsg(
        `Got it! Here's the summary:\n💰 ₹${finalDraft.amount}\n🏷️ ${finalDraft.category}\n📝 ${finalDraft.note || '—'}\n\nConfirm?`,
        ['Yes, save it', 'Cancel']
      )
    );
  };

  // History messages from expenses
  const historyMessages = expenses.map((e) => ({
    id: e._id,
    from: 'history',
    expense: e,
  }));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Expenses</span>
        <span style={styles.monthLabel}>{currentMonth}</span>
      </div>

      {/* Messages area */}
      <div style={styles.messages}>
        {/* Expense history at top */}
        {historyMessages.length > 0 && (
          <div style={styles.historyLabel}>— This month's expenses —</div>
        )}
        {historyMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} onDelete={deleteExpense} />
        ))}
        {historyMessages.length > 0 && (
          <div style={styles.historyLabel}>— Now —</div>
        )}

        {/* Bot conversation */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onOptionSelect={handleOptionSelect}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        {step === 'note' && (
          <button style={styles.skipBtn} onClick={handleSkip}>
            Skip
          </button>
        )}

        {step === null ? (
          <button style={styles.addBtn} onClick={startLogging}>
            + Log Expense
          </button>
        ) : (
          <>
            <input
              style={styles.input}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                step === 'amount' ? 'Enter amount...' :
                step === 'note' ? 'Add a note...' : ''
              }
              disabled={step === 'category' || step === 'confirm' || loading}
              autoFocus
            />
            {(step === 'amount' || step === 'note') && (
              <button style={styles.sendBtn} onClick={handleSend} disabled={loading}>
                ➤
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f0f0f5',
  },
  header: {
    background: '#6c63ff',
    color: '#fff',
    padding: '1rem 1.25rem 0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  monthLabel: {
    fontSize: '0.8rem',
    opacity: 0.85,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  historyLabel: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#aaa',
    margin: '0.5rem 0',
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#fff',
    borderTop: '1px solid #eee',
  },
  addBtn: {
    flex: 1,
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: '2rem',
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    border: '1px solid #ddd',
    borderRadius: '2rem',
    padding: '0.65rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    background: '#f9f9f9',
  },
  sendBtn: {
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    background: 'none',
    border: '1px solid #ccc',
    borderRadius: '2rem',
    padding: '0.4rem 0.9rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: '#888',
  },
};

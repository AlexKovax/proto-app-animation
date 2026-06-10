import { useState } from 'react';
import { useStore } from '../store/useStore';

interface VoteOption {
  id: string;
  label: string;
}

export default function Vote() {
  const { participants, navigateTo } = useStore();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<VoteOption[]>([
    { id: 'o1', label: '' },
    { id: 'o2', label: '' },
  ]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  const addOption = () => {
    setOptions([...options, { id: `o${Date.now()}`, label: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
    setVotes((v) => {
      const copy = { ...v };
      Object.keys(copy).forEach((pid) => {
        if (copy[pid] === id) delete copy[pid];
      });
      return copy;
    });
  };

  const updateOption = (id: string, label: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, label } : o)));
  };

  const startVote = () => {
    setVotes({});
    setStarted(true);
  };

  const setVote = (participantId: string, optionId: string) => {
    setVotes((v) => ({ ...v, [participantId]: optionId }));
  };

  const reset = () => {
    setStarted(false);
    setQuestion('');
    setVotes({});
    setOptions([
      { id: 'o1', label: '' },
      { id: 'o2', label: '' },
    ]);
  };

  const voteCounts = options.map((o) => ({
    ...o,
    count: Object.values(votes).filter((v) => v === o.id).length,
  }));
  const totalVotes = Object.keys(votes).length;
  const maxCount = Math.max(...voteCounts.map((o) => o.count), 1);

  return (
    <div className="tool-page">
      <div className="tool-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigateTo('dashboard')}>
          ← Retour
        </button>
        <h2>Vote</h2>
      </div>

      {!started ? (
        <div className="card">
          <div className="card-header"><h4>Nouveau vote</h4></div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label className="input-label">Question</label>
              <input
                className="input-brutal"
                type="text"
                placeholder="La question soumise au vote"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="input-label">Options</label>
              {options.map((o, idx) => (
                <div key={o.id} className="vote-option-row" style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', alignItems: 'center' }}>
                  <span className="badge">{idx + 1}</span>
                  <input
                    className="input-brutal"
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={o.label}
                    onChange={(e) => updateOption(o.id, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => removeOption(o.id)}
                    disabled={options.length <= 2}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addOption}>
                + Ajouter une option
              </button>
            </div>

            <button
              className="btn btn-primary btn-lg"
              disabled={!question.trim() || options.some((o) => !o.label.trim())}
              onClick={startVote}
            >
              Démarrer le vote
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header">
              <h3>{question}</h3>
              <span className="badge">{totalVotes} / {participants.length} votants</span>
            </div>
            <div className="card-body">
              <div className="vote-results">
                {voteCounts.map((o) => (
                  <div key={o.id} className="vote-result-bar-wrap" style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <strong>{o.label}</strong>
                      <span>{o.count}</span>
                    </div>
                    <div className="vote-bar-bg">
                      <div
                        className={`vote-bar-fill ${o.count === maxCount && o.count > 0 ? 'vote-bar-winner' : ''}`}
                        style={{ width: `${(o.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="card-header"><h4>Votes par participant</h4></div>
            <div className="card-body">
              {participants.length === 0 ? (
                <p className="text-muted">Aucun participant dans la liste.</p>
              ) : (
                <div className="vote-list">
                  {participants.map((p) => (
                    <div key={p.id} className="vote-row">
                      <span className="participant-name">{p.emoji} {p.name}</span>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {options.map((o) => (
                          <button
                            key={o.id}
                            className={`btn btn-sm ${votes[p.id] === o.id ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setVote(p.id, o.id)}
                          >
                            {o.label}
                          </button>
                        ))}
                        {votes[p.id] && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setVote(p.id, '')}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <button className="btn btn-outline btn-md" onClick={reset}>
              Nouveau vote
            </button>
          </div>
        </>
      )}
    </div>
  );}
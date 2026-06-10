import { useState } from 'react';
import { useStore } from '../store/useStore';

const EMOJI_OPTIONS = ['😀', '😎', '🤩', '🧐', '🤓', '🐱', '🐶', '🦊', '🐼', '🐨', '🌟', '🔥', '💡', '🎯', '🚀', '🎨', '🎵', '🌈', '🍕', '☕'];

export default function Participants() {
  const { participants, addParticipant, updateParticipant, removeParticipant, reorderParticipants, clearParticipants, setParticipantEmoji, navigateTo } = useStore();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [emojiOpen, setEmojiOpen] = useState<string | null>(null);

  const handleAdd = () => {
    if (name.trim()) {
      addParticipant(name.trim());
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const startEdit = (p: typeof participants[0]) => {
    setEditingId(p.id);
    setEditName(p.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateParticipant(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      reorderParticipants(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="tool-page">
      <div className="tool-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigateTo('dashboard')}>
          ← Retour
        </button>
        <h2>Participants</h2>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <div className="add-form">
            <input
              className="input-brutal"
              type="text"
              placeholder="Prénom ou nom du participant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button className="btn btn-primary btn-md" onClick={handleAdd}>
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="card card-subtle">
          <div className="card-body">
            <p className="text-muted">Aucun participant pour le moment.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="participant-list">
            {participants.map((p, idx) => (
              <div
                key={p.id}
                className={`card participant-row ${dragIdx === idx ? 'dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div className="card-body participant-row-body">
                  <span className="participant-index badge">{idx + 1}</span>

                  <button
                    className="participant-emoji-btn"
                    onClick={() => setEmojiOpen(emojiOpen === p.id ? null : p.id)}
                    style={{ fontSize: '1.4rem' }}
                  >
                    {p.emoji || '👤'}
                  </button>

                  {emojiOpen === p.id && (
                    <div className="emoji-picker card" onClick={(e) => e.stopPropagation()}>
                      <div className="card-body" style={{ padding: 'var(--space-3)' }}>
                        <div className="emoji-grid">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              className="emoji-option"
                              onClick={() => { setParticipantEmoji(p.id, emoji); setEmojiOpen(null); }}
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            className="emoji-option emoji-clear"
                            onClick={() => { setParticipantEmoji(p.id, ''); setEmojiOpen(null); }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {editingId === p.id ? (
                    <input
                      className="input-brutal"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                    />
                  ) : (
                    <span className="participant-name">{p.name}</span>
                  )}

                  {p.color && (
                    <span className="participant-color" style={{ backgroundColor: p.color }} />
                  )}

                  <div className="participant-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>
                      ✏️
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => removeParticipant(p.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
            <button className="btn btn-outline btn-md" onClick={clearParticipants}>
              Vider la liste
            </button>
          </div>
        </>
      )}
    </div>
  );}
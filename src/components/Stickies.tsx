import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';

interface Sticky {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

const STICKY_COLORS = ['#FFE600', '#FF6B6B', '#4ECDC4', '#7C4DFF', '#FF9500', '#00C7BE', '#FF2D92', '#0066FF', '#FFFFFF', '#F5F5F0'];

function loadStickies(): Sticky[] {
  try {
    const raw = localStorage.getItem('cockpit_stickies');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStickies(stickies: Sticky[]) {
  localStorage.setItem('cockpit_stickies', JSON.stringify(stickies));
}

export default function Stickies() {
  const { navigateTo } = useStore();
  const [stickies, setStickies] = useState<Sticky[]>(loadStickies);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    saveStickies(stickies);
  }, [stickies]);

  const addSticky = () => {
    if (!newText.trim()) return;
    const id = Date.now().toString();
    setStickies((s) => [
      ...s,
      { id, text: newText.trim(), color: '#FFE600', x: 20 + Math.random() * 100, y: 20 + Math.random() * 100 },
    ]);
    setNewText('');
  };

  const updateText = (id: string, text: string) => {
    setStickies((s) => s.map((st) => (st.id === id ? { ...st, text } : st)));
  };

  const changeColor = (id: string, color: string) => {
    setStickies((s) => s.map((st) => (st.id === id ? { ...st, color } : st)));
  };

  const removeSticky = (id: string) => {
    setStickies((s) => s.filter((st) => st.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (editingId === id) return;
    const sticky = stickies.find((s) => s.id === id);
    if (!sticky || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    dragRef.current = {
      id,
      offsetX: e.clientX - rect.left - sticky.x,
      offsetY: e.clientY - rect.top - sticky.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragRef.current.offsetX);
    const y = Math.max(0, e.clientY - rect.top - dragRef.current.offsetY);
    setStickies((s) =>
      s.map((st) => (st.id === dragRef.current!.id ? { ...st, x, y } : st))
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const clearAll = () => setStickies([]);

  return (
    <div className="tool-page">
      <div className="tool-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigateTo('dashboard')}>
          ← Retour
        </button>
        <h2>Post-it</h2>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body">
          <div className="add-form">
            <input
              className="input-brutal"
              type="text"
              placeholder="Nouvelle idée..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addSticky(); }}
            />
            <button className="btn btn-primary btn-md" onClick={addSticky}>
              + Ajouter
            </button>
            {stickies.length > 0 && (
              <button className="btn btn-outline btn-md" onClick={clearAll}>
                Vider le tableau
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stickies-board card" ref={boardRef}>
        {stickies.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <p className="text-muted">Le tableau est vide. Ajoute des post-it !</p>
          </div>
        ) : (
          stickies.map((sticky) => (
            <div
              key={sticky.id}
              className="sticky-note card"
              style={{
                left: sticky.x,
                top: sticky.y,
                backgroundColor: sticky.color,
                opacity: dragRef.current?.id === sticky.id ? 0.85 : 1,
              }}
              onMouseDown={(e) => handleMouseDown(e, sticky.id)}
            >
              {editingId === sticky.id ? (
                <textarea
                  className="sticky-edit"
                  value={sticky.text}
                  onChange={(e) => updateText(sticky.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                />
              ) : (
                <div className="sticky-text" onDoubleClick={() => setEditingId(sticky.id)}>
                  {sticky.text}
                </div>
              )}
              <div className="sticky-actions">
                <div className="sticky-colors">
                  {STICKY_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      className={`sticky-color-dot ${sticky.color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={(e) => { e.stopPropagation(); changeColor(sticky.id, c); }}
                    />
                  ))}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={(e) => { e.stopPropagation(); removeSticky(sticky.id); }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );}
import { useStore } from '../store/useStore';
import Dashboard from './Dashboard';
import Participants from './Participants';
import Timer from './Timer';
import Icebreaker from './Icebreaker';
import Vote from './Vote';
import Stickies from './Stickies';
import { useCallback, useState } from 'react';

const TOOLS: Record<string, { label: string; emoji: string; disabled: boolean }> = {
  participants: { label: 'Participants', emoji: '👥', disabled: false },
  timer: { label: 'Timer', emoji: '⏱️', disabled: false },
  icebreaker: { label: 'Icebreaker', emoji: '🧊', disabled: false },
  vote: { label: 'Vote', emoji: '📊', disabled: false },
  stickies: { label: 'Post-it', emoji: '📝', disabled: false },
};

export default function App() {
  const { currentTool, navigateTo, participants } = useStore();
  const [panelOpen, setPanelOpen] = useState(false);

  const handleToolChange = useCallback(
    (tool: string) => {
      navigateTo(tool as any);
      setPanelOpen(false);
    },
    [navigateTo]
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigateTo('dashboard')}>
          Cockpit
        </button>
        <div className="header-actions">
          <span className="badge">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          <button className="btn btn-outline btn-sm" onClick={() => setPanelOpen(!panelOpen)}>
            Outils
          </button>
        </div>
      </header>

      {panelOpen && (
        <div className="tool-panel" onClick={() => setPanelOpen(false)}>
          <div className="tool-panel-content card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h4>Outils</h4>
            </div>
            <div className="card-body">
              <div className="tool-panel-grid">
                {Object.entries(TOOLS).map(([id, t]) => (
                  <button
                    key={id}
                    className="tool-panel-item"
                    onClick={() => handleToolChange(id)}
                    disabled={t.disabled}
                  >
                    <span className="tool-emoji">{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="app-main">
        {currentTool === 'dashboard' && <Dashboard />}
        {currentTool === 'participants' && <Participants />}
        {currentTool === 'timer' && <Timer />}
        {currentTool === 'icebreaker' && <Icebreaker />}
        {currentTool === 'vote' && <Vote />}
        {currentTool === 'stickies' && <Stickies />}
      </main>
    </div>
  );
}

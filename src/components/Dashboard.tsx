import { useStore } from '../store/useStore';

const TOOL_CARDS = [
  { id: 'participants', label: 'Participants', emoji: '👥', desc: 'Gérer la liste des participants', disabled: false },
  { id: 'timer', label: 'Timer', emoji: '⏱️', desc: 'Minuteur pour cadencer les exercices', disabled: false },
  { id: 'icebreaker', label: 'Icebreaker', emoji: '🧊', desc: 'Brise glace en tour de rôle', disabled: false },
  { id: 'vote', label: 'Vote', emoji: '📊', desc: 'Organiser un vote rapide', disabled: false },
  { id: 'stickies', label: 'Post-it', emoji: '📝', desc: 'Tableau de post-it virtuels', disabled: false },
];

export default function Dashboard() {
  const navigateTo = useStore((s) => s.navigateTo);
  const participants = useStore((s) => s.participants);

  return (
    <div className="dashboard">
      <h1>Cockpit d'animation</h1>
      <p className="text-muted">Tous les outils pour animer ton atelier à distance</p>

      <div className="dashboard-grid">
        {TOOL_CARDS.map((tool) => (
          <button
            key={tool.id}
            className="card card-interactive dashboard-card"
            onClick={() => navigateTo(tool.id as any)}
            disabled={tool.disabled}
          >
            <span className="dashboard-card-emoji">{tool.emoji}</span>
            <div>
              <h4>{tool.label}</h4>
              <small className="text-muted">{tool.desc}</small>
            </div>
          </button>
        ))}
      </div>

      <div className="dashboard-info card card-subtle">
        <div className="card-body">
          <strong>{participants.length} participant{participants.length !== 1 ? 's' : ''}</strong> dans la liste
          {participants.length === 0 && (
            <p className="text-muted">Ajoute des participants pour commencer</p>
          )}
        </div>
      </div>
    </div>
  );
}
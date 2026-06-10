import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ICEBREAKER_QUESTIONS, POP_CULTURE_QUESTIONS, METEO_QUESTIONS } from '../data';

type Format = 'surprise' | 'meteo' | 'popculture' | 'verites';

interface FormatDef {
  id: Format;
  label: string;
  desc: string;
  questionBank: string[];
  hasQuestions: boolean;
}

const FORMATS: FormatDef[] = [
  { id: 'surprise', label: 'Question surprise', desc: 'Chaque participant reçoit une question fun tirée au sort', hasQuestions: true, questionBank: ICEBREAKER_QUESTIONS },
  { id: 'meteo', label: 'Météo intérieure', desc: 'Chacun décrit son humeur par une métaphore', hasQuestions: true, questionBank: METEO_QUESTIONS },
  { id: 'popculture', label: 'Pop culture', desc: 'Chacun répond avec une référence culturelle', hasQuestions: true, questionBank: POP_CULTURE_QUESTIONS },
  { id: 'verites', label: 'Deux vérités, un mensonge', desc: 'Devine l\'affirmation fausse parmi les trois', hasQuestions: false, questionBank: [] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestion(bank: string[]): string {
  return bank[Math.floor(Math.random() * bank.length)];
}

export default function Icebreaker() {
  const { participants, navigateTo } = useStore();
  const [format, setFormat] = useState<FormatDef | null>(null);
  const [order, setOrder] = useState<typeof participants>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [finished, setFinished] = useState(false);

  const start = (f: FormatDef, doShuffle: boolean) => {
    setFormat(f);
    setShuffled(doShuffle);
    const list = doShuffle ? shuffle(participants) : [...participants];
    setOrder(list);
    if (f.hasQuestions) {
      setQuestions(list.map(() => pickQuestion(f.questionBank)));
    } else {
      setQuestions([]);
    }
    setCurrentIdx(0);
    setFinished(false);
  };

  const current = order[currentIdx];
  const isLast = currentIdx >= order.length - 1;

  const next = () => {
    if (currentIdx < order.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const prev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setFinished(false);
    }
  };

  const rerollQuestion = () => {
    if (format?.hasQuestions && currentIdx < questions.length) {
      const newQ = pickQuestion(format.questionBank);
      setQuestions((q) => {
        const copy = [...q];
        copy[currentIdx] = newQ;
        return copy;
      });
    }
  };

  const restart = () => setFormat(null);

  if (!format) {
    return (
      <div className="tool-page">
        <div className="tool-header">
          <button className="btn btn-outline btn-sm" onClick={() => navigateTo('dashboard')}>
            ← Retour
          </button>
          <h2>Icebreaker</h2>
        </div>

        {participants.length === 0 && (
          <div className="card card-highlight">
            <div className="card-body">
              <p>Ajoute des participants avant de lancer un icebreaker.</p>
            </div>
          </div>
        )}

        <div className="dashboard-grid" style={{ marginTop: 'var(--space-6)' }}>
          {FORMATS.map((f) => (
            <div key={f.id} className="card">
              <div className="card-header"><h4>{f.label}</h4></div>
              <div className="card-body">
                <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>{f.desc}</p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={participants.length === 0}
                    onClick={() => start(f, false)}
                  >
                    Dans l'ordre
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={participants.length === 0}
                    onClick={() => start(f, true)}
                  >
                    Ordre aléatoire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const vert = format?.id === 'verites';

  return (
    <div className="tool-page">
      <div className="tool-header">
        <button className="btn btn-outline btn-sm" onClick={restart}>
          ← Formats
        </button>
        <div>
          <h2>{format?.label}</h2>
          <small className="text-muted">{shuffled ? 'Ordre aléatoire' : 'Dans l\'ordre'}</small>
        </div>
      </div>

      {finished ? (
        <div className="card card-highlight">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-4xl)' }}>🎉 Tour terminé !</h2>
            <p style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }} className="text-muted">
              Tous les participants sont passés ({order.length} / {order.length})
            </p>
            <button className="btn btn-primary btn-lg" onClick={restart}>
              Nouvel icebreaker
            </button>
          </div>
        </div>
      ) : current ? (
        <>
          <div className="icebreaker-main card">
            <div className="card-body">
              <div className="icebreaker-participant">
                {current.emoji && <span className="icebreaker-emoji">{current.emoji}</span>}
                {current.color && (
                  <div className="icebreaker-color-dot" style={{ backgroundColor: current.color }} />
                )}
                <h1 style={{ fontSize: 'var(--text-5xl)' }}>{current.name}</h1>
              </div>

              {vert ? (
                <div className="icebreaker-question">
                  <p style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)' }}>
                    Énonce deux vérités et un mensonge sur toi.
                  </p>
                  <p className="text-muted" style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-2)' }}>
                    Le groupe doit deviner laquelle est fausse !
                  </p>
                </div>
              ) : format?.hasQuestions && currentIdx < questions.length ? (
                <div className="icebreaker-question">
                  <p style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)' }}>
                    {questions[currentIdx]}
                  </p>
                  <button className="btn btn-outline btn-sm" onClick={rerollQuestion} style={{ marginTop: 'var(--space-4)' }}>
                    ↻ Nouvelle question
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="icebreaker-progress" style={{ marginTop: 'var(--space-6)' }}>
            <div className="badge" style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-3) var(--space-6)' }}>
              {currentIdx + 1} / {order.length}
            </div>
            <div className="icebreaker-nav" style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <button className="btn btn-outline btn-md" onClick={prev} disabled={currentIdx === 0}>
                ← Précédent
              </button>
              <button className="btn btn-primary btn-lg" onClick={next}>
                {isLast ? 'Terminer →' : 'Suivant →'}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );}
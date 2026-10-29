import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clipboard,
  Clock3,
  Copy,
  Gamepad2,
  Hash,
  LockKeyhole,
  PartyPopper,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import { backendLabel, makeRoomCode, supabase } from './supabase';

type Screen = 'home' | 'create' | 'join' | 'lobby';

type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
  host?: boolean;
};

const playerColors = ['coral', 'violet', 'mint', 'gold', 'blue', 'pink', 'lime', 'sky'];

const samplePlayers: Player[] = [
  { id: 'sample-1', name: 'Léa', color: 'violet', score: 0 },
  { id: 'sample-2', name: 'Nino', color: 'mint', score: 0 }
];

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [pseudo, setPseudo] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [targetPlayers, setTargetPlayers] = useState(4);
  const [players, setPlayers] = useState<Player[]>([]);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  const isLobbyReady = players.length >= targetPlayers;
  const openSeats = Math.max(targetPlayers - players.length, 0);
  const stageProgress = useMemo(() => (screen === 'lobby' ? 1 : 0), [screen]);

  useEffect(() => {
    const client = supabase;
    if (!client || screen !== 'lobby' || !roomCode) return;

    const channel = client
      .channel(`quiz-room-${roomCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_players' }, () => {
        setNotice('La salle vient de recevoir une mise à jour.');
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [roomCode, screen]);

  function goHome() {
    setScreen('home');
    setNotice('');
    setCopied(false);
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPseudo = pseudo.trim();
    if (cleanPseudo.length < 2) {
      setNotice('Choisis un pseudo de 2 caractères minimum.');
      return;
    }

    setRoomCode(makeRoomCode());
    setPlayers([
      { id: 'host', name: cleanPseudo, color: 'coral', score: 0, host: true },
      ...samplePlayers.slice(0, Math.min(2, targetPlayers - 1))
    ]);
    setNotice('La salle est prête. Partage le code avec les autres joueurs.');
    setScreen('lobby');
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPseudo = pseudo.trim();
    const cleanCode = roomCode.replace(/\D/g, '');
    if (cleanPseudo.length < 2) {
      setNotice('Choisis un pseudo de 2 caractères minimum.');
      return;
    }
    if (cleanCode.length !== 6) {
      setNotice('Le code doit contenir exactement 6 chiffres.');
      return;
    }

    setRoomCode(cleanCode);
    setPlayers([
      ...samplePlayers,
      { id: 'local', name: cleanPseudo, color: 'coral', score: 0 }
    ]);
    setNotice('Tu as rejoint la salle. En attente des autres joueurs.');
    setScreen('lobby');
  }

  async function copyRoomCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice('Le code est sélectionné : tu peux le copier manuellement.');
    }
  }

  function renderHome() {
    return (
      <main className="home-layout">
        <section className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Le quiz qui rassemble</div>
          <h1>Le bon réflexe.<br /><em>Le bon moment.</em><br />Le bon score.</h1>
          <p className="hero-lede">Un quiz familial, rapide et plein de rebondissements. On se retrouve autour d’un code, on répond ensemble, et chaque seconde compte.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => { setNotice(''); setScreen('create'); }}>
              <Gamepad2 size={19} /> Créer une salle <ArrowRight size={17} />
            </button>
            <button className="button button-secondary" onClick={() => { setNotice(''); setScreen('join'); }}>
              <Hash size={18} /> Rejoindre une salle
            </button>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={15} /> Sans compte</span>
            <span><Users size={15} /> 4 à 8 joueurs</span>
            <span><Radio size={15} /> Synchronisé en direct</span>
          </div>
        </section>

        <section className="hero-stage" aria-label="Aperçu d'une question">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="quiz-preview-card">
            <div className="preview-topline">
              <span className="live-pill"><span className="live-dot" /> ÉTAPE 1</span>
              <span className="preview-timer"><Clock3 size={14} /> 00:30</span>
            </div>
            <div className="preview-category">GÉOGRAPHIE <span>•</span> QUESTION 02</div>
            <h2>Quel est le plus grand océan du monde ?</h2>
            <div className="preview-answers">
              <div className="preview-answer"><span>A</span> Atlantique</div>
              <div className="preview-answer selected"><span>B</span> Pacifique <Check size={15} /></div>
              <div className="preview-answer"><span>C</span> Indien</div>
              <div className="preview-answer"><span>D</span> Arctique</div>
            </div>
            <div className="preview-footer"><span><Zap size={14} /> Plus rapide = 3 pts</span><span>4 réponses</span></div>
          </div>
          <div className="floating-score score-one"><Trophy size={15} /> +3 <small>Léa</small></div>
          <div className="floating-score score-two"><span className="mini-avatar mint">N</span> Nino <strong>+2</strong></div>
          <div className="stage-caption"><span className="caption-number">01</span><span>Réponds avant<br /><strong>que le chrono sonne.</strong></span></div>
        </section>

        <section className="feature-strip">
          <div className="feature-intro"><span>COMMENT ÇA MARCHE</span><strong>Trois étapes.<br />Une seule couronne.</strong></div>
          <div className="feature-item"><b className="feature-number">01</b><div><strong>On se retrouve</strong><p>Un code de salle, un pseudo, et c’est parti.</p></div></div>
          <div className="feature-item"><b className="feature-number">02</b><div><strong>On se challenge</strong><p>30, 20 puis 10 secondes pour faire la différence.</p></div></div>
          <div className="feature-item"><b className="feature-number">03</b><div><strong>On se qualifie</strong><p>Les meilleurs filent vers la grande finale.</p></div></div>
        </section>
      </main>
    );
  }

  function renderForm(kind: 'create' | 'join') {
    const isCreate = kind === 'create';
    return (
      <main className="form-layout">
        <section className="form-intro">
          <button className="back-link" onClick={goHome}><ArrowLeft size={16} /> Retour à l’accueil</button>
          <div className="eyebrow"><span className="eyebrow-mark">{isCreate ? '01' : '02'}</span> {isCreate ? 'Nouvelle partie' : 'Entrer dans la partie'}</div>
          <h1>{isCreate ? <>Installe le plateau.<br /><em>On s’occupe du reste.</em></> : <>Le code est prêt ?<br /><em>À toi de jouer.</em></>}</h1>
          <p>{isCreate ? 'Choisis le nombre de joueurs, donne ton pseudo et partage le code de salle autour de toi.' : 'Entre le code reçu sur l’écran de l’hôte, puis choisis le nom sous lequel tu vas jouer.'}</p>
          <div className="form-aside-note"><LockKeyhole size={17} /><span>Pas de compte, pas de mot de passe.<br /><strong>Juste un bon pseudo.</strong></span></div>
        </section>

        <section className="form-card">
          <div className="form-card-heading"><span className="card-kicker">{isCreate ? 'CRÉER UNE SALLE' : 'REJOINDRE UNE SALLE'}</span><span className="card-step">{isCreate ? '1 / 2' : '1 / 2'}</span></div>
          <form onSubmit={isCreate ? handleCreate : handleJoin}>
            {!isCreate && <label className="field-label">Code de la salle<div className="input-wrap code-input"><Hash size={19} /><input autoFocus value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000 000" inputMode="numeric" /></div><span className="field-hint">6 chiffres, affichés sur l’écran de l’hôte</span></label>}
            <label className="field-label">Ton pseudo<div className="input-wrap"><span className="input-avatar">{pseudo.trim().slice(0, 1).toUpperCase() || '?'}</span><input autoFocus={isCreate} value={pseudo} onChange={(event) => setPseudo(event.target.value.slice(0, 20))} placeholder="Ex. Capitaine Quiz" maxLength={20} /></div><span className="field-hint">2 à 20 caractères · visible par toute la salle</span></label>
            {isCreate && <label className="field-label">Nombre de joueurs<div className="player-options">{[4, 5, 6, 7, 8].map((count) => <button type="button" key={count} className={`player-option ${targetPlayers === count ? 'active' : ''}`} onClick={() => setTargetPlayers(count)}><strong>{count}</strong><span>joueurs</span>{targetPlayers === count && <Check size={14} />}</button>)}</div><span className="field-hint">La partie démarre quand ce nombre est atteint.</span></label>}
            {notice && <div className="form-notice"><Radio size={15} /> {notice}</div>}
            <button className="button button-primary button-wide" type="submit">{isCreate ? 'Créer le code de salle' : 'Rejoindre la salle'} <ArrowRight size={17} /></button>
          </form>
          <div className="form-card-foot"><span><ShieldCheck size={14} /> Données de partie temporaires</span><span><Users size={14} /> Jusqu’à 8</span></div>
        </section>
      </main>
    );
  }

  function renderLobby() {
    return (
      <main className="lobby-layout">
        <section className="lobby-main">
          <button className="back-link" onClick={goHome}><ArrowLeft size={16} /> Quitter la salle</button>
          <div className="lobby-heading-row"><div><div className="eyebrow"><Radio size={15} /> Salle en direct</div><h1>On attend les <em>champions.</em></h1></div><div className="sync-badge"><span className="live-dot" /> {backendLabel}</div></div>
          <div className="room-code-panel"><div><span className="card-kicker">CODE À PARTAGER</span><div className="room-code">{roomCode.slice(0, 3)} <span>{roomCode.slice(3)}</span></div><p>Les joueurs rejoignent avec ce code depuis le même lien.</p></div><button className="copy-button" onClick={copyRoomCode}>{copied ? <Check size={18} /> : <Copy size={18} />}<span>{copied ? 'Copié !' : 'Copier le code'}</span></button></div>
          <div className="players-section"><div className="section-heading"><div><span className="card-kicker">JOUEURS CONNECTÉS</span><h2>{players.length} <span>/ {targetPlayers}</span></h2></div><div className="seat-progress"><span style={{ width: `${Math.min((players.length / targetPlayers) * 100, 100)}%` }} /></div></div><div className="players-grid">{players.map((player, index) => <div className="player-card" key={player.id}><span className={`player-avatar ${player.color}`}>{player.name.slice(0, 1).toUpperCase()}</span><div><strong>{player.name}</strong><span>{player.host ? 'Hôte de la salle' : 'Prêt à jouer'}</span></div>{player.host ? <span className="host-tag">HÔTE</span> : <span className="ready-check"><Check size={14} /></span>}</div>)}{Array.from({ length: openSeats }).map((_, index) => <div className="player-card empty" key={`empty-${index}`}><span className="player-avatar empty-avatar"><Users size={17} /></span><div><strong>Place libre</strong><span>En attente d’un joueur</span></div></div>)}</div></div>
          {notice && <div className="lobby-notice"><PartyPopper size={17} /> {notice}</div>}
          <button className={`button button-primary button-wide start-button ${!isLobbyReady ? 'disabled' : ''}`} disabled={!isLobbyReady} onClick={() => setNotice('Le lancement de la partie sera disponible dans la prochaine étape de l’édition.')}>{isLobbyReady ? 'Lancer la partie' : `Encore ${openSeats} joueur${openSeats > 1 ? 's' : ''} pour commencer`}<ChevronRight size={18} /></button>
        </section>

        <aside className="lobby-aside"><div className="aside-card rules-card"><div className="aside-card-head"><span className="card-kicker">LE PARCOURS</span><Gamepad2 size={19} /></div><div className="stage-list"><div className="stage-row active"><span className="stage-index">01</span><div><strong>Le déclic</strong><span>30 secondes · objectif 9 pts</span></div><Check size={16} /></div><div className="stage-row"><span className="stage-index">02</span><div><strong>La remontée</strong><span>20 secondes · objectif 9 pts</span></div><LockKeyhole size={15} /></div><div className="stage-row"><span className="stage-index">03</span><div><strong>La finale</strong><span>10 secondes · jusqu’à 12 pts</span></div><LockKeyhole size={15} /></div></div></div><div className="aside-card categories-card"><div className="aside-card-head"><span className="card-kicker">AU MENU CE SOIR</span><Sparkles size={18} /></div><div className="category-cloud"><span className="category-chip coral">Culture G</span><span className="category-chip mint">Sport</span><span className="category-chip violet">Musique</span><span className="category-chip gold">Géographie</span><span className="category-chip sky">Familial</span></div><p>Une question déjà jouée reste au repos pendant 24 heures.</p></div><div className="aside-tip"><Zap size={17} /><span><strong>Petit conseil</strong><br />Le plus rapide n’est pas toujours celui qui gagne. Reste concentré.</span></div></aside>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar"><button className="brand" onClick={goHome} aria-label="Retour à l’accueil"><span className="brand-mark"><Trophy size={17} /></span><span>QUESTION <b>CHAMPION</b></span></button><div className="topbar-meta"><span className="edition-pill">ÉDITION FAMILIALE <span>·</span> 01</span><span className="topbar-line" /></div></header>
      {screen === 'home' && renderHome()}
      {screen === 'create' && renderForm('create')}
      {screen === 'join' && renderForm('join')}
      {screen === 'lobby' && renderLobby()}
      <footer className="site-footer"><span>QUESTION CHAMPION <b>—</b> Le quiz qui rassemble.</span><span>Un jeu simple, une grande soirée.</span></footer>
    </div>
  );
}

export default App;

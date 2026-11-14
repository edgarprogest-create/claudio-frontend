const PCOL = { default: '#e9e9ee', brother: '#ff8a50', health: '#43e0a0', coaching: '#7c9cff', meal: '#ffd166', stylist: '#ff6fae', spiritual: '#b69cff', nomad: '#3dd6c6', looksmax: '#f4a261' };
Object.entries(PCOL).forEach(([k, v]) => { if (PERSONAS[k]) PERSONAS[k].color = v; });

const STYLES = {
  noir: { name: 'Noir', desc: 'Pure black. Voice first. Floating nav.', bg: '#000', ink: '#f2f2f0', acc: '#25d366' },
  papel: { name: 'Paper', desc: 'Light and editorial. Ink, rules, calm.', bg: '#f3eee5', ink: '#14120e', acc: '#0d7a3f' },
  cor: { name: 'Colour', desc: 'Every humanoid has its own colour.', bg: '#101114', ink: '#f4f4f6', acc: '#ff8a50' },
};

Object.assign(I18N['Português'], { 'Style': 'Estilo', 'Noir': 'Noir', 'Paper': 'Papel', 'Colour': 'Cor', 'Choose your style': 'Escolhe o teu estilo',
  'Pure black. Voice first. Floating nav.': 'Preto puro. Voz primeiro. Navegação flutuante.', 'Light and editorial. Ink, rules, calm.': 'Claro e editorial. Tinta, linhas, calma.', 'Every humanoid has its own colour.': 'Cada humanoid tem a sua cor.', 'Style:': 'Estilo:' });
Object.assign(I18N['Español'], { 'Style': 'Estilo', 'Noir': 'Noir', 'Paper': 'Papel', 'Colour': 'Color', 'Choose your style': 'Elige tu estilo',
  'Pure black. Voice first. Floating nav.': 'Negro puro. Voz primero. Navegación flotante.', 'Light and editorial. Ink, rules, calm.': 'Claro y editorial. Tinta, líneas, calma.', 'Every humanoid has its own colour.': 'Cada humanoid tiene su propio color.', 'Style:': 'Estilo:' });
Object.assign(I18N['Français'], { 'Style': 'Style', 'Noir': 'Noir', 'Paper': 'Papier', 'Colour': 'Couleur', 'Choose your style': 'Choisis ton style',
  'Pure black. Voice first. Floating nav.': 'Noir pur. La voix d\'abord. Navigation flottante.', 'Light and editorial. Ink, rules, calm.': 'Clair et éditorial. Encre, filets, calme.', 'Every humanoid has its own colour.': 'Chaque humanoid a sa propre couleur.', 'Style:': 'Style :' });

function StylePreview({ id }) {
  const s = STYLES[id];
  return (
    <div className="style-prev" style={{ background: s.bg }}>
      <div style={{ position: 'absolute', left: 8, top: 10, width: 30, height: 5, borderRadius: 3, background: s.ink }}></div>
      {id === 'cor'
        ? <><div style={{ position: 'absolute', left: 8, top: 24, width: 22, height: 28, borderRadius: 6, background: '#ff8a50' }}></div><div style={{ position: 'absolute', left: 34, top: 24, width: 22, height: 28, borderRadius: 6, background: '#43e0a0' }}></div></>
        : <div style={{ position: 'absolute', left: 8, right: 8, top: 24, height: id === 'noir' ? 28 : 1, borderRadius: id === 'noir' ? 8 : 0, background: id === 'noir' ? 'radial-gradient(circle at 80% 30%, #25d366, #0c0d0c 70%)' : s.ink }}></div>}
      {id === 'papel' && <><div style={{ position: 'absolute', left: 8, top: 32, width: 14, height: 9, background: s.acc }}></div><div style={{ position: 'absolute', left: 8, right: 8, top: 48, height: 1, background: s.ink, opacity: .3 }}></div></>}
      <div style={{ position: 'absolute', right: 8, bottom: 22, width: 26, height: 8, borderRadius: 4, background: id === 'papel' ? s.ink : id === 'cor' ? '#ff8a50' : '#1a1c1a' }}></div>
      <div style={{ position: 'absolute', left: id === 'noir' ? 6 : 0, right: id === 'noir' ? 6 : 0, bottom: id === 'noir' ? 5 : 0, height: 10, borderRadius: id === 'noir' ? 5 : 0, background: id === 'papel' ? 'transparent' : id === 'noir' ? '#1f211f' : '#1a1c20', borderTop: id === 'papel' ? '1px solid rgba(20,18,14,.3)' : 'none' }}></div>
      <div style={{ position: 'absolute', left: '50%', bottom: id === 'noir' ? 7 : 2, width: 6, height: 6, marginLeft: -3, borderRadius: id === 'cor' ? 2 : 3, background: s.acc }}></div>
    </div>
  );
}

function StyleSheet({ value, onPick, onClose }) {
  return (
    <Sheet onClose={onClose}>
      <Eyebrow style={{ marginBottom: 6 }}>Style</Eyebrow>
      <div className="display" style={{ fontSize: 26, marginBottom: 18 }}>{t('Choose your style')}</div>
      {Object.keys(STYLES).map(id => (
        <div key={id} data-tap className={`style-opt ${value === id ? 'on' : ''}`} onClick={() => { onPick(id); onClose(); }}>
          <StylePreview id={id}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>{t(STYLES[id].name)}</div>
            <div style={{ fontSize: 12.5, color: 'var(--dim)', lineHeight: 1.4 }}>{t(STYLES[id].desc)}</div>
          </div>
          {value === id && <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>✓</div>}
        </div>
      ))}
    </Sheet>
  );
}

Object.entries({"Português":"Enquadramento razoável. Luz chapada — usa luz natural lateral da próxima vez e fotografa a 30°, não de frente.","Español":"Encuadre correcto. Luz plana — usa luz natural lateral la próxima vez y dispara a 30°, no de frente.","Français":"Cadrage correct. Lumière plate — utilise une lumière naturelle de côté la prochaine fois et prends la photo à 30°, pas de face."}).forEach(([l, v]) => { I18N[l]["Frame is decent. Lighting is flat — use natural side-light next time and shoot at a 30° angle, not straight on."] = v; });

Object.assign(window, { PCOL, STYLES, StyleSheet, StylePreview });

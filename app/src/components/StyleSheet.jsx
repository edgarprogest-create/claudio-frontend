import { useI18n } from '../i18n/index.jsx';
import { STYLES } from '../data/styles.js';
import { Sheet, Eyebrow } from './ui.jsx';

const IRIS = 'conic-gradient(from 210deg,#ff9a5a,#ffd36e,#86e3c8,#5aa8ff,#b48cff,#ff7aa8,#ff9a5a)';

/** Glass: light grey page, white floating cards, iridescent orb, black pill button. */
function VidroPreview() {
  const card = { position: 'absolute', background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px rgba(17,20,24,.10)' };
  return (
    <div className="style-prev" style={{ background: '#f6f7f8' }}>
      <div style={{ position: 'absolute', left: 8, top: 10, width: 30, height: 5, borderRadius: 3, background: '#111418' }}></div>
      <div style={{ position: 'absolute', left: '50%', top: 22, width: 22, height: 22, marginLeft: -11, borderRadius: '50%',
        background: `radial-gradient(circle at 34% 28%,rgba(255,255,255,.95),rgba(255,255,255,0) 50%),${IRIS}`, boxShadow: '0 3px 6px rgba(17,20,24,.15)' }}></div>
      <div style={{ ...card, left: 8, right: 8, top: 52, height: 9 }}></div>
      <div style={{ position: 'absolute', right: 8, bottom: 20, width: 24, height: 8, borderRadius: 4, background: '#eef0f2' }}></div>
      <div style={{ ...card, left: 0, right: 0, bottom: 0, height: 10, borderRadius: '6px 6px 0 0' }}></div>
      <div style={{ position: 'absolute', left: '50%', bottom: 4, width: 8, height: 8, marginLeft: -4, borderRadius: '50%', background: '#111418', boxShadow: '0 2px 4px rgba(17,20,24,.25)' }}></div>
    </div>
  );
}

function StylePreview({ id }) {
  if (id === 'vidro') return <VidroPreview/>;
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

export default function StyleSheet({ value, onPick, onClose }) {
  const { t } = useI18n();
  return (
    <Sheet onClose={onClose}>
      <Eyebrow style={{ marginBottom: 6 }}>{t('Style')}</Eyebrow>
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

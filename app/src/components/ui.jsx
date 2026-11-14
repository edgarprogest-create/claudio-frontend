import { useI18n, tr } from '../i18n/index.jsx';

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = tr(msg);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

export const Eyebrow = ({ children, style, className = '' }) => <div className={`eyebrow ${className}`} style={style}>{children}</div>;

export const ClaudioMark = () => <span className="claudio-mark">claudio</span>;

/** Highlighted word in display titles (accent colour, not italic). */
export const Hi = ({ children }) => <span className="italic">{children}</span>;

export function PrimaryBtn({ children, onClick, full, style, disabled, type = 'button' }) {
  return (
    <button type={type} data-tap onClick={onClick} disabled={disabled} className="btn-primary"
      style={{ width: full ? '100%' : undefined, ...style }}>{children}</button>
  );
}

export function AppBar({ left, mid, right }) {
  return (
    <>
      <div className="app-pad-top"></div>
      <div className="appbar">
        <div style={{ minWidth: 60, display: 'flex' }}>{left}</div>
        <div>{mid}</div>
        <div style={{ minWidth: 60, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
      </div>
    </>
  );
}

export function Sheet({ onClose, children, tall }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}></div>
      <div className="sheet-inner" role="dialog" aria-modal="true" style={tall ? { maxHeight: '86%' } : null}>
        <div className="sheet-grab"></div>
        {children}
      </div>
    </>
  );
}

export function ListSheet({ title, items, onClose }) {
  const { t } = useI18n();
  return (
    <Sheet onClose={onClose}>
      {title && <Eyebrow style={{ marginBottom: 12 }}>{t(title)}</Eyebrow>}
      <div className="card" style={{ overflow: 'hidden' }}>
        {items.map((it, i) => (
          <div key={it.label} data-tap onClick={() => { onClose(); it.onClick(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', minHeight: 52, borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', color: it.danger ? 'var(--error)' : 'var(--text)' }}>
            {it.icon && <span style={{ width: 20, textAlign: 'center', color: it.danger ? 'var(--error)' : 'var(--accent)', fontSize: 16 }}>{it.icon}</span>}
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{t(it.label)}</span>
            {it.check && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

export function Confirm({ title, body, action, danger, onConfirm, onClose }) {
  const { t } = useI18n();
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}></div>
      <div className="dialog" role="alertdialog" aria-modal="true">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>{t(title)}</div>
        <div style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.45, marginBottom: 18 }}>{t(body)}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-tap className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>{t('Cancel')}</button>
          <button data-tap className="btn-primary" style={{ flex: 1, background: danger ? 'var(--error)' : undefined, boxShadow: danger ? 'none' : undefined }}
            onClick={() => { onConfirm(); onClose(); }}>{t(action)}</button>
        </div>
      </div>
    </>
  );
}

export function Orb({ size = 200, state = 'idle', onClick }) {
  return (
    <div data-tap={onClick ? '' : undefined} onClick={onClick} className={`orb orb-${state}`} style={{ width: size, height: size }}>
      <div className="orb-core"></div>
      <div className="orb-ring r1"></div>
      <div className="orb-ring r2"></div>
    </div>
  );
}

export function SGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{label}</Eyebrow>
      <div className="card" style={{ overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

export function SRow({ label, value, danger, onClick, last }) {
  return (
    <div data-tap onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', minHeight: 50, borderBottom: last ? 'none' : '1px solid var(--border)', color: danger ? 'var(--error)' : 'var(--text)' }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</div>
      {value && <div style={{ fontSize: 13, color: 'var(--dim)', marginRight: 8 }}>{value}</div>}
      <div style={{ color: danger ? 'var(--error)' : 'var(--faint)', fontSize: 16 }}>›</div>
    </div>
  );
}

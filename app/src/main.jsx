import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './i18n/index.jsx';
import App from './App.jsx';
import './lib/install.js'; // capture beforeinstallprompt as early as possible
import './styles/tokens.css';
import './styles/themes.css';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <App/>
    </I18nProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

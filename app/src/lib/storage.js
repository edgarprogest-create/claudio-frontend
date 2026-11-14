// localStorage keys — shared with the old index.html so sessions carry over.
export const K = {
  token: 'claudio_token',
  name: 'claudio_name',
  email: 'claudio_email',
  onboardingDone: 'claudio_onboarding_done',
  style: 'claudio_style',
  langChosen: 'claudio_lang_chosen',
};

export const store = {
  get: k => localStorage.getItem(k),
  set: (k, v) => localStorage.setItem(k, v),
  del: k => localStorage.removeItem(k),
};

export function saveSession({ token, name, email }) {
  if (token) store.set(K.token, token);
  if (name) store.set(K.name, name);
  if (email) store.set(K.email, email);
  store.set(K.onboardingDone, '1');
}

export function clearSession() {
  [K.token, K.name, K.email].forEach(store.del);
}

export const hasSession = () => !!store.get(K.token);

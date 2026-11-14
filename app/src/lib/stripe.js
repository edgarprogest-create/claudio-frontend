// Publishable key (public by design) — same as the old index.html.
const STRIPE_KEY = 'pk_live_51TLQdFLV8IOXC246UAk7rGSkKCMrhXeFrVrCl8zjnyFR3RCotlB51J7YADPIE5nmCIfbZHVLk8NqlQjMRjkMAHMr00K5I7ddJG';

let promise;

/** Loads Stripe.js on demand (only when Checkout opens). */
export function loadStripe() {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      if (window.Stripe) return resolve(window.Stripe(STRIPE_KEY));
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.async = true;
      s.onload = () => (window.Stripe ? resolve(window.Stripe(STRIPE_KEY)) : reject(new Error('Stripe unavailable')));
      s.onerror = () => { promise = null; reject(new Error('Stripe unavailable')); };
      document.head.appendChild(s);
    });
  }
  return promise;
}

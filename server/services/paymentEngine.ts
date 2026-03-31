import { randomUUID } from 'crypto';

export type CardPayload = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
};

function digitsOnly(s: string) {
  return s.replace(/\D/g, '');
}

function luhnCheck(num: string) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function detectBrand(cardNumberDigits: string) {
  if (cardNumberDigits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(cardNumberDigits)) return 'Mastercard';
  if (/^3[47]/.test(cardNumberDigits)) return 'Amex';
  if (/^6/.test(cardNumberDigits)) return 'RuPay';
  return 'Card';
}

/** Sandbox-style test cards (no real network). */
function testCardOutcome(cardNumberDigits: string): { ok: true } | { ok: false; code: string; message: string } {
  const n = cardNumberDigits;
  if (n === '4242424242424242') return { ok: true };
  if (n === '4000000000000002') return { ok: false, code: 'card_declined', message: 'Your card was declined.' };
  if (n === '4000000000009995') return { ok: false, code: 'insufficient_funds', message: 'Insufficient funds.' };
  if (n === '4000000000000069') return { ok: false, code: 'expired_card', message: 'Your card has expired.' };
  if (n === '4000000000000127') return { ok: false, code: 'incorrect_cvc', message: "Your card's security code is incorrect." };
  return { ok: true };
}

export function validateAndAuthorizeCard(method: CardPayload): { brand: string; last4: string } {
  const cardNumberDigits = digitsOnly(method.cardNumber);
  const expiry = method.expiry.trim();
  const cvc = digitsOnly(method.cvc);
  const name = method.name.trim();

  if (cardNumberDigits.length < 12 || cardNumberDigits.length > 19 || !luhnCheck(cardNumberDigits)) {
    throw new Error('The card number is invalid.');
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    throw new Error('Expiry must be in MM/YY.');
  }
  if (cvc.length < 3) {
    throw new Error('CVC must be at least 3 digits.');
  }
  if (!name) {
    throw new Error('Please enter the cardholder name.');
  }

  const outcome = testCardOutcome(cardNumberDigits);
  if (!outcome.ok) {
    throw new Error(outcome.message);
  }

  return { brand: detectBrand(cardNumberDigits), last4: cardNumberDigits.slice(-4) };
}

export function makeReceiptId() {
  return `rcpt_${randomUUID().replace(/-/g, '').slice(0, 22)}`;
}

export function makePaymentIntentId() {
  return `pi_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

export function makeUpiReference() {
  return `VB${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

export function buildQrPayload(amountInr: number, transactionRef: string) {
  const pa = process.env.UPI_VPA || 'voyagebharat@paytm';
  const pn = encodeURIComponent(process.env.UPI_PAYEE_NAME || 'Voyage Bharat');
  return `upi://pay?pa=${encodeURIComponent(pa)}&pn=${pn}&am=${amountInr}&cu=INR&tr=${encodeURIComponent(transactionRef)}`;
}

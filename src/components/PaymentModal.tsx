import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, CreditCard, Loader2, Lock, QrCode, Receipt, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export type PaymentItem = {
  id: string;
  title: string;
  subtitle?: string;
  amountInr: number;
};

type IntentResponse = {
  id: string;
  status: string;
  qrDataUrl: string;
  upiReference: string;
  amountInr: number;
};

type ConfirmSuccess = {
  success: true;
  receiptId: string;
  paymentIntentId: string;
  item: PaymentItem;
  payment: { status: string; brand?: string; last4?: string; receiptId?: string };
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItem | null;
}

function formatInr(n: number) {
  return n.toLocaleString('en-IN');
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, '');
}

export default function PaymentModal({ isOpen, onClose, item }: PaymentModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success' | 'failed'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [lastPayment, setLastPayment] = useState<ConfirmSuccess['payment'] | null>(null);

  const amountLabel = useMemo(() => (item ? formatInr(item.amountInr) : '0'), [item]);

  const reset = () => {
    setStep('details');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setName('');
    setError(null);
    setSubmitting(false);
    setIntent(null);
    setReceiptId(null);
    setLastPayment(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !item) return;
    let cancelled = false;
    setSubmitting(true);
    setError(null);
    setStep('details');
    setIntent(null);
    setReceiptId(null);
    setLastPayment(null);

    api<IntentResponse>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({
        amountInr: item.amountInr,
        title: item.title,
        subtitle: item.subtitle ?? '',
        itemId: item.id,
      }),
    })
      .then((data) => {
        if (!cancelled) setIntent(data);
      })
      .catch((e: Error & { status?: number }) => {
        if (!cancelled) {
          if (e.status === 403) setError('Verify your email to complete checkout.');
          else setError(e.message || 'Could not start checkout.');
        }
      })
      .finally(() => {
        if (!cancelled) setSubmitting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, item?.id, item?.amountInr, item?.title, item?.subtitle]);

  const refreshQr = async () => {
    if (!intent) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await api<{ qrDataUrl: string; upiReference: string }>(`/payments/${encodeURIComponent(intent.id)}/refresh-qr`, {
        method: 'POST',
      });
      setIntent((prev) => (prev ? { ...prev, qrDataUrl: data.qrDataUrl, upiReference: data.upiReference } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not refresh QR.');
    } finally {
      setSubmitting(false);
    }
  };

  const continueToPayment = () => {
    setError(null);
    if (!user) {
      setError('Please sign in to continue.');
      return;
    }
    setStep('payment');
  };

  const onPay = async () => {
    setError(null);
    if (!user || !item || !intent) return;

    setSubmitting(true);
    setStep('processing');
    try {
      const data = await api<ConfirmSuccess>(`/payments/${encodeURIComponent(intent.id)}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          cardNumber: digitsOnly(cardNumber),
          expiry: expiry.trim(),
          cvc: digitsOnly(cvc),
          name: name.trim(),
        }),
      });
      setReceiptId(data.receiptId);
      setLastPayment(data.payment);
      setStep('success');
    } catch (e) {
      const err = e as Error & { status?: number; body?: { error?: string; paymentIntentId?: string } };
      setError(err.body?.error || err.message || 'Payment failed.');
      setStep('failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'details' ? (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Secure checkout</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-600" />
                      Encrypted session • UPI or card
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{item.title}</div>
                      {item.subtitle && <div className="text-sm text-gray-600 mt-1">{item.subtitle}</div>}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-xl font-extrabold text-gray-900">₹{amountLabel}</div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-700">
                      <div className="font-bold">Payment reference</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono break-all">{intent?.id ?? (submitting ? 'Creating…' : '—')}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Status: <span className="font-bold text-gray-700">{intent?.status ?? 'starting'}</span>
                    </div>
                  </div>

                  {intent?.qrDataUrl && (
                    <div className="flex flex-col items-center gap-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <QrCode className="w-4 h-4 text-orange-600" />
                        Scan to pay (UPI)
                      </div>
                      <img src={intent.qrDataUrl} alt="Payment QR" className="w-48 h-48 rounded-xl border border-gray-200 bg-white p-2" />
                      <p className="text-xs text-gray-500 text-center font-mono">Ref: {intent.upiReference}</p>
                      <button
                        type="button"
                        onClick={refreshQr}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
                        New QR code
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={continueToPayment}
                    disabled={submitting || !intent}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-extrabold transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Pay with card
                  </button>
                  <p className="mt-3 text-xs text-gray-500 text-center">Sandbox cards: 4242… success • 4000…0002 decline • 4000…9995 insufficient funds</p>
                </div>
              </div>
            ) : step === 'payment' ? (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Card details</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-600" />
                      PCI-style tokenization on the server
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{item.title}</div>
                      {item.subtitle && <div className="text-sm text-gray-600 mt-1">{item.subtitle}</div>}
                      <div className="text-xs text-gray-500 mt-2 font-mono">Ref: {intent?.id}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-xl font-extrabold text-gray-900">₹{amountLabel}</div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card number</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry</label>
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVC</label>
                      <input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="123"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cardholder name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name on card"
                      autoComplete="cc-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onPay}
                    disabled={submitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-extrabold transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Pay ₹{amountLabel}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={submitting}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition-colors disabled:opacity-60"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : step === 'processing' ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900">Processing payment</h3>
                <p className="text-gray-600 mt-2">Contacting issuer • Verifying • Finalizing…</p>
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left">
                  <div className="text-xs text-gray-500">Reference</div>
                  <div className="font-bold text-gray-900 mt-1 font-mono text-sm break-all">{intent?.id}</div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                {step === 'success' ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-gray-900">Payment successful</h3>
                    <p className="text-gray-600 mt-2">Your booking is confirmed.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-gray-900">Payment failed</h3>
                    <p className="text-gray-600 mt-2">{error || 'Try another card or payment method.'}</p>
                  </>
                )}

                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{item.title}</div>
                      {item.subtitle && <div className="text-sm text-gray-600 mt-1">{item.subtitle}</div>}
                      <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        {step === 'success'
                          ? `Receipt ${receiptId ?? '—'} • ${lastPayment?.brand ?? 'Card'} •••• ${lastPayment?.last4 ?? digitsOnly(cardNumber).slice(-4)}`
                          : `Reference ${intent?.id ?? '—'}`}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-xl font-extrabold text-gray-900">₹{amountLabel}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" onClick={close} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-colors">
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      onClose();
                      window.location.hash = '#booking';
                    }}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold transition-colors"
                  >
                    Back to results
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

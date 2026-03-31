import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, CreditCard, Receipt, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

type BookingRow = {
  id: string;
  paymentIntentId: string;
  item: { id: string; title: string; subtitle?: string; amountInr: number };
  payment: {
    status: string;
    method?: string;
    brand?: string;
    last4?: string;
    receiptId?: string;
    paymentIntentId?: string;
    error?: string;
  };
  createdAt: string;
};

interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatInr(n: number) {
  return n.toLocaleString('en-IN');
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function BookingsModal({ isOpen, onClose }: BookingsModalProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setError(null);
    api<{ bookings: BookingRow[] }>('/bookings', { method: 'GET' })
      .then((d) => setBookings(d.bookings))
      .catch((e: Error & { status?: number }) => {
        if (e.status === 403) setError('Verify your email to view booking history.');
        else setError(e.message || 'Could not load bookings.');
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, user?.id]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 overflow-y-auto flex-1">
              <h3 className="text-3xl font-serif font-bold text-gray-900">My bookings</h3>
              <p className="text-gray-600 mt-2">Your trips and payment history.</p>

              {!user ? (
                <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-5 text-orange-900">Sign in to view your bookings.</div>
              ) : error ? (
                <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800">{error}</div>
              ) : loading ? (
                <div className="mt-8 text-gray-600">Loading…</div>
              ) : bookings.length === 0 ? (
                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-gray-700">
                  No bookings yet. Use the <span className="font-bold">Bookings</span> section and complete a payment to see history here.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {bookings.map((b) => {
                    const paid = b.payment.status === 'paid';
                    return (
                      <div key={b.id} className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate">{b.item.title}</div>
                            {b.item.subtitle && <div className="text-sm text-gray-600 mt-1">{b.item.subtitle}</div>}
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(b.createdAt)}
                              </span>
                              {b.payment.receiptId && (
                                <span className="inline-flex items-center gap-2">
                                  <Receipt className="w-4 h-4" />
                                  {b.payment.receiptId}
                                </span>
                              )}
                              {b.paymentIntentId && (
                                <span className="inline-flex items-center gap-2 font-mono">
                                  <CreditCard className="w-4 h-4" />
                                  {b.paymentIntentId}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="text-xs text-gray-500">Total</div>
                            <div className="text-xl font-extrabold text-gray-900">₹{formatInr(b.item.amountInr)}</div>
                            <div
                              className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                                paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {paid ? 'PAID' : 'FAILED'}
                            </div>
                            {b.payment.last4 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {b.payment.brand ?? 'Card'} •••• {b.payment.last4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup' | 'verify';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, verifyEmail, requestPasswordReset, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify' | 'forgot' | 'reset'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode === 'verify' ? 'verify' : initialMode === 'signup' ? 'signup' : 'signin');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setVerifyToken('');
    setResetToken('');
    setNewPassword('');
    setSubmitting(false);
    setError(null);
    setInfo(null);
  }, [isOpen, initialMode]);

  const title = useMemo(() => {
    switch (mode) {
      case 'signup':
        return 'Create your account';
      case 'verify':
        return 'Verify email';
      case 'forgot':
        return 'Reset password';
      case 'reset':
        return 'Set new password';
      default:
        return 'Welcome back';
    }
  }, [mode]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'signup') {
        const res = await signUpWithEmail({ displayName, email, password });
        setInfo('Check your email for a verification link.');
        setMode('verify');
        onSuccess?.();
      } else if (mode === 'signin') {
        await signInWithEmail({ email, password });
        onSuccess?.();
        onClose();
      } else if (mode === 'verify') {
        await verifyEmail(verifyToken);
        setInfo('Email verified. You can use bookings and payments.');
        onSuccess?.();
      } else if (mode === 'forgot') {
        const r = await requestPasswordReset(email);
        setInfo('If an account exists, reset instructions were sent.');
        setMode('reset');
      } else if (mode === 'reset') {
        await resetPassword(resetToken, newPassword);
        setInfo('Password updated. Sign in with your new password.');
        setMode('signin');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 text-center">{title}</h2>
              <p className="text-gray-500 mb-6 text-center text-sm">
                {mode === 'signin' && 'Sign in with your email and password.'}
                {mode === 'signup' && 'Create a secure account. Password must be at least 8 characters.'}
                {mode === 'verify' && 'Enter the verification code from your email.'}
                {mode === 'forgot' && 'We will email reset instructions if the account exists.'}
                {mode === 'reset' && 'Enter the reset token and a new password.'}
              </p>

              {(mode === 'signin' || mode === 'signup') && (
                <div className="grid grid-cols-2 bg-gray-100 rounded-2xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-colors ${mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-colors ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                  >
                    Sign up
                  </button>
                </div>
              )}

              {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              {info && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm break-all">{info}</div>}

              <div className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {(mode === 'signin' || mode === 'signup') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        type="password"
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {mode === 'verify' && (
                  <input
                    value={verifyToken}
                    onChange={(e) => setVerifyToken(e.target.value)}
                    placeholder="Verification code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                  />
                )}

                {mode === 'reset' && (
                  <>
                    <input
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Reset token"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm"
                    />
                    <input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (8+ characters)"
                      type="password"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-orange-700 shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'verify' ? 'Verify' : mode === 'forgot' ? 'Send reset' : 'Update password'}
                </button>

                {mode === 'signin' && (
                  <button type="button" className="w-full text-sm text-orange-600 font-semibold" onClick={() => { setMode('forgot'); setError(null); setInfo(null); }}>
                    Forgot password?
                  </button>
                )}

                {mode === 'verify' && (
                  <button type="button" className="w-full text-sm text-gray-600" onClick={onClose}>
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { ApiError } from '../lib/api';

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] font-black tracking-widest uppercase text-smash-text-secondary">{children}</span>
);

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 0
            ? 'Cannot reach the SMASH server. Start it with `npm run dev` in smash/server.'
            : err.message
          : 'Something went wrong. Try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-smash-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-1 border border-white/10 rounded-[32px] p-8 flex flex-col gap-6 shadow-2xl shadow-black/50"
      >
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" showText />
          <p className="text-[9px] uppercase tracking-[0.2em] text-smash-text-secondary font-bold">
            Smart Multi-AI System Hub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              autoComplete="username"
              required
              icon={<Mail size={14} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              autoComplete="current-password"
              required
              icon={<KeyRound size={14} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full font-black">
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

import { AlertCircle, Eye, Loader2, Lock, Mail, Wrench } from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';


import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from "@/utils/toast";
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  // Prefill saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem('cmms:rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Enter your password';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem('cmms:rememberedEmail', email);
      } else {
        localStorage.removeItem('cmms:rememberedEmail');
      }

      showSuccess('Login successful!');
    } catch (err) {
      console.error('Login exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('network')) {
        showError('Network connection failed. Try again.');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showError('Enter your email first');
      return;
    }
    try {
      setLoading(true);
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`
      });
      if (error) {
        showError(error.message);
      } else {
        showSuccess('Password reset link sent. Check your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setOauthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) showError(error.message);
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-machinery-50 via-white to-steel-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(0,0,0,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Login Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-lg border border-border/50 shadow-sm overflow-hidden">
          {/* Logo Section - Clean & Minimal */}
          <div className="px-8 pt-10 pb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}

              className="w-16 h-16 bg-gradient-to-br from-steel-500 to-steel-600 rounded-lg flex items-center justify-center shadow-sm ring-4 ring-steel-500/10"
            >
              <Wrench className="w-9 h-9 text-white" />
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    animate={{
                      scale: errors.email ? [1, 1.2, 1] : 1,
                      color: errors.email ? '#dc2626' : undefined
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </motion.div>
                  <motion.input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    disabled={loading || oauthLoading}
                    autoFocus
                    animate={errors.email ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "w-full pl-11 pr-4 py-3 text-sm rounded-xl border-2 transition-all duration-200",
                      "focus:outline-none focus:ring-4",
                      errors.email
                        ? "border-warning-300 focus:border-warning-500 focus:ring-warning-500/20 bg-warning-50/50 dark:bg-warning-900/10 dark:border-warning-700"
                        : "border-input focus:border-primary focus:ring-primary/20 bg-background text-foreground hover:border-border",
                      "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
                      "placeholder:text-muted-foreground"
                    )}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-warning-600 dark:text-warning-400 flex items-center gap-1.5 font-medium"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    animate={{
                      scale: errors.password ? [1, 1.2, 1] : 1,
                      color: errors.password ? '#dc2626' : undefined
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </motion.div>
                  <motion.input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    disabled={loading || oauthLoading}
                    animate={errors.password ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "w-full pl-11 pr-12 py-3 text-sm rounded-xl border-2 transition-all duration-200",
                      "focus:outline-none focus:ring-4",
                      errors.password
                        ? "border-warning-300 focus:border-warning-500 focus:ring-warning-500/20 bg-warning-50/50 dark:bg-warning-900/10 dark:border-warning-700"
                        : "border-input focus:border-primary focus:ring-primary/20 bg-background text-foreground hover:border-border",
                      "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
                      "placeholder:text-muted-foreground"
                    )}
                    placeholder="••••••••"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-machinery-400 hover:text-steel-600 dark:hover:text-steel-400 transition-colors"
                    tabIndex={-1}
                  >
                    <motion.div
                      animate={{
                        rotate: showPassword ? 0 : 0,
                        scale: showPassword ? 1.1 : 1
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye
                        className={cn(
                          "w-5 h-5 transition-colors",
                          showPassword ? 'text-steel-500 dark:text-steel-400' : ''
                        )}
                      />
                    </motion.div>
                  </motion.button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-warning-600 dark:text-warning-400 flex items-center gap-1.5 font-medium"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between pt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading || oauthLoading}
                    className="w-4 h-4 text-primary border-input rounded focus:ring-primary focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed bg-background transition-all"
                  />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Remember me
                  </span>
                </label>
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                  disabled={loading || oauthLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs font-semibold text-steel-600 dark:text-steel-400 hover:text-steel-700 dark:hover:text-steel-300 transition-colors disabled:text-machinery-400 disabled:cursor-not-allowed"
                >
                  Forgot password?
                </motion.button>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  className="w-full mt-6 shadow-sm hover:shadow-md transition-shadow"
                  disabled={loading || oauthLoading}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign in
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="relative my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card/80 backdrop-blur-sm px-4 text-muted-foreground font-medium uppercase tracking-wider">
                    or
                  </span>
                </div>
              </motion.div>

              {/* Google Login */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  className="w-full hover:shadow-md transition-shadow"
                  disabled={loading || oauthLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoogleLogin();
                  }}
                >
                  {oauthLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {!oauthLoading && (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




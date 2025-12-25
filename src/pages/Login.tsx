import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
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

    // Validate
    const newErrors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Please enter your password';
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
      if (error) {
        throw error;
      }

      // Remember email for convenience
      if (rememberMe) {
        localStorage.setItem('cmms:rememberedEmail', email);
      } else {
        localStorage.removeItem('cmms:rememberedEmail');
      }

      showSuccess('Login successful!');

      // Session context will handle redirect

    } catch (err) {
      console.error('Login exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('network')) {
        showError('Network connection error. Please try again.');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showError('Please enter your email first.');
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
        showSuccess('Password reset link sent. Please check your email.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-brand-50 to-neutral-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-gray-800 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-8 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <Icon icon="tabler:tools" className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  GOGO CMMS
                </h1>
                <p className="text-brand-100 text-sm">
                  Maintenance Management System
                </p>
              </div>
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-gray-100 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-neutral-500 dark:text-gray-400">
                Sign in to continue to your account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon icon="tabler:mail" className="h-5 w-5 text-neutral-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    disabled={loading || oauthLoading}
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900",
                      errors.email
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500 bg-error-50 dark:bg-error-900/20 dark:border-error-700"
                        : "border-neutral-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 dark:text-gray-100",
                      "disabled:bg-neutral-50 dark:disabled:bg-gray-800 disabled:text-neutral-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed",
                      "placeholder:text-neutral-400 dark:placeholder:text-gray-500"
                    )}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
                    <Icon icon="tabler:alert-circle" className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon icon="tabler:lock" className="h-5 w-5 text-neutral-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    disabled={loading || oauthLoading}
                    className={cn(
                      "w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-gray-900",
                      errors.password
                        ? "border-error-300 focus:border-error-500 focus:ring-error-500 bg-error-50 dark:bg-error-900/20 dark:border-error-700"
                        : "border-neutral-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500 bg-white dark:bg-gray-800 dark:text-gray-100",
                      "disabled:bg-neutral-50 dark:disabled:bg-gray-800 disabled:text-neutral-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed",
                      "placeholder:text-neutral-400 dark:placeholder:text-gray-500"
                    )}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    <Icon 
                      icon={showPassword ? "tabler:eye-off" : "tabler:eye"} 
                      className="h-5 w-5" 
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
                    <Icon icon="tabler:alert-circle" className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading || oauthLoading}
                    className="w-4 h-4 text-brand-600 border-neutral-300 dark:border-gray-600 rounded focus:ring-brand-500 focus:ring-offset-0 dark:focus:ring-offset-gray-900 cursor-pointer disabled:cursor-not-allowed dark:bg-gray-800"
                  />
                  <span className="text-sm text-neutral-600 dark:text-gray-400 group-hover:text-neutral-900 dark:group-hover:text-gray-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                  disabled={loading || oauthLoading}
                  className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors disabled:text-neutral-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <ProfessionalButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={oauthLoading}
                icon="tabler:login"
                className="mt-6"
              >
                Sign in
              </ProfessionalButton>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-gray-900 px-3 text-neutral-500 dark:text-gray-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <ProfessionalButton
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                loading={oauthLoading}
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleLogin();
                }}
                icon="flat-color-icons:google"
                className="gap-2"
              >
                Sign in with Google
              </ProfessionalButton>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-neutral-50 dark:bg-gray-800 border-t border-neutral-200 dark:border-gray-700 text-center">
            <p className="text-xs text-neutral-500 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-neutral-500 dark:text-gray-400">
            Need help?{' '}
            <a href="#" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
              Contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

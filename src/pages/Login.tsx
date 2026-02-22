import { AlertCircle, BatteryCharging, Bike, Eye, Loader2, Lock, Mail, Wrench, Zap } from 'lucide-react';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';


import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from "@/utils/toast";
import { cn } from '@/lib/utils';

// Fleet E-Mobility Background Pattern Component
const FleetMobilityPattern = () => {
  // Create a pattern of icons - 6x5 grid (30 icons total)
  const icons = [Bike, BatteryCharging, Zap, Wrench];
  const gridItems = [];
  
  // Generate a grid of icons with some randomization
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const iconIndex = (row * 6 + col) % icons.length;
      const Icon = icons[iconIndex];
      gridItems.push(
        <div
          key={`${row}-${col}`}
          className="flex items-center justify-center"
        >
          <Icon className="w-8 h-8 text-teal-500" strokeWidth={1.5} />
        </div>
      );
    }
  }

  return (
    <div className="absolute inset-0 opacity-10">
      <div className="grid grid-cols-6 gap-24 p-16 h-full">
        {gridItems}
      </div>
    </div>
  );
};

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
      
      // Navigate immediately after successful login
      // This ensures tests work in headless browsers where session state updates may be delayed
      navigate('/', { replace: true });
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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-12 bg-white">
        {/* Logo */}
        <div className="absolute top-12 left-12 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Gogo Electric</h2>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
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
                  autoFocus
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
                    "transition-colors",
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200",
                    "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
                    "placeholder:text-slate-400"
                  )}
                  placeholder="you@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
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
                    "w-full pl-10 pr-12 py-2.5 text-sm rounded-lg border bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
                    "transition-colors",
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200",
                    "disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed",
                    "placeholder:text-slate-400"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading || oauthLoading}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-600/20 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm text-slate-600">
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
                className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white"
              disabled={loading || oauthLoading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-slate-200 hover:bg-muted"
              disabled={loading || oauthLoading}
              onClick={(e) => {
                e.preventDefault();
                handleGoogleLogin();
              }}
            >
              {oauthLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {!oauthLoading && (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Brand */}
      <div className="hidden lg:flex flex-1 bg-slate-900 p-12 flex-col justify-center relative overflow-hidden">
        {/* Fleet E-Mobility Pattern Overlay */}
        <FleetMobilityPattern />

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-2xl font-medium text-white leading-relaxed">
              "Powering the future of African mobility with reliable, efficient electric vehicle maintenance."
            </p>
            <footer className="text-slate-400">
              <div className="font-medium text-white">Gogo Electric</div>
              <div className="text-sm">Fleet Management System</div>
            </footer>
          </blockquote>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}




import React, { useState, FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { Spin } from 'antd';
import { showError } from "@/utils/toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();
  const logoUrl = settings.logo_url;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      showError(error.message);
    }
    // The SessionProvider will handle the redirect on success
    setLoading(false);
  };

  const Logo = () => (
    <div className="mb-4">
      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
        {isLoadingSettings ? <Spin /> : logoUrl ? (
          <img src={logoUrl} alt="System Logo" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="text-xs text-gray-500">Logo</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Logo />

      {/* Title */}
      <h1 className="mb-1 text-2xl font-bold text-gray-800">GOGO Electric</h1>
      <p className="mb-6 text-sm text-gray-500">GOGO Maintenance Management Platform</p>

      {/* Login Box */}
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm text-purple-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded border border-gray-300 pl-10 pr-10 py-2 text-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-purple-700 px-3 py-2 text-sm font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-purple-400 flex items-center justify-center"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>

        {/* Sign up */}
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <a href="#" className="text-purple-600 hover:underline">
            Sign up
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-xs text-gray-500">
        <a href="#" className="px-2 hover:underline">
          Terms
        </a>
        <a href="#" className="px-2 hover:underline">
          Privacy
        </a>
        <a href="#" className="px-2 hover:underline">
          Security
        </a>
        <a href="#" className="px-2 hover:underline">
          Contact
        </a>
      </footer>
    </div>
  );
}
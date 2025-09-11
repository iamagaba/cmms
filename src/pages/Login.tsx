import React, { useState, FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { Spin, Input, Button } from 'antd'; // Import Input and Button from antd
import { showError } from "@/utils/toast";

export default function Login() {
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
    <div className="mb-6">
      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
        {isLoadingSettings ? <Spin /> : logoUrl ? (
          <img src={logoUrl} alt="System Logo" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="text-sm text-gray-500">Logo</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Logo />

      {/* Title */}
      <h1 className="mb-2 text-3xl font-bold text-gray-800">GOGO Electric</h1>
      <p className="mb-8 text-base text-gray-500">GOGO Maintenance Management Platform</p>

      {/* Login Box */}
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label className="mb-2 block text-base font-medium text-gray-700">
              Email address
            </label>
            <Input
              prefix={<Mail className="h-5 w-5 text-gray-400" />}
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="large" // Use Ant Design size prop
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-base text-purple-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <Input.Password
              prefix={<Lock className="h-5 w-5 text-gray-400" />}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="large" // Use Ant Design size prop
              iconRender={(visible) => (visible ? <Eye size={20} /> : <EyeOff size={20} />)}
            />
          </div>

          {/* Submit */}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full flex items-center justify-center" // Keep Tailwind for flex layout
            size="large" // Use Ant Design size prop
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Sign in
          </Button>
        </form>

        {/* Sign up */}
        <div className="mt-6 text-center text-base">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <a href="#" className="text-purple-600 hover:underline">
            Sign up
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-sm text-gray-500">
        <a href="#" className="px-3 hover:underline">
          Terms
        </a>
        <a href="#" className="px-3 hover:underline">
          Privacy
        </a>
        <a href="#" className="px-3 hover:underline">
          Security
        </a>
        <a href="#" className="px-3 hover:underline">
          Contact
        </a>
      </footer>
    </div>
  );
}
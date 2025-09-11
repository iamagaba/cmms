import React, { useState, FormEvent } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { Spin, Input, Button, Typography, Space, Flex, Card, theme } from 'antd';
import { showError } from "@/utils/toast";

const { Title, Text, Link } = Typography;
const { useToken } = theme;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();
  const logoUrl = settings.logo_url;
  const { token } = useToken();

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
    setLoading(false);
  };

  const Logo = () => (
    <div style={{ marginBottom: token.marginLG }}>
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
    <Flex align="center" justify="center" className="min-h-screen bg-gray-50 p-4">
      <Flex align="center" style={{ flexDirection: 'column', maxWidth: 480, width: '100%' }}> {/* Fixed: Replaced 'direction' prop with inline style */}
        <Logo />

        <Title level={1} style={{ marginBottom: token.marginXS, color: token.colorTextHeading }}>GOGO Electric</Title>
        <Text type="secondary" style={{ marginBottom: token.marginXL }}>GOGO Maintenance Management Platform</Text>

        <Card className="w-full max-w-md" style={{ padding: token.paddingLG, boxShadow: token.boxShadowSecondary }}>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label style={{ marginBottom: token.marginXS, display: 'block', color: token.colorText }}>
                Email address
              </label>
              <Input
                prefix={<Mail size={20} className="text-gray-400" />}
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="large"
              />
            </div>

            <div>
              <Flex justify="space-between" align="center" style={{ marginBottom: token.marginXS }}>
                <label style={{ display: 'block', color: token.colorText }}>
                  Password
                </label>
                <Link href="#" style={{ color: token.colorPrimary }}>
                  Forgot password?
                </Link>
              </Flex>
              <Input.Password
                prefix={<Lock size={20} className="text-gray-400" />}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="large"
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={loading ? <Loader2 size={20} className="animate-spin" /> : null}
            >
              Sign in
            </Button>
          </form>

          <Flex justify="center" style={{ marginTop: token.marginLG }}>
            <Text type="secondary">Don't have an account?</Text>{" "}
            <Link href="#" style={{ color: token.colorPrimary, marginLeft: token.marginXXS }}>
              Sign up
            </Link>
          </Flex>
        </Card>

        <Space size="middle" style={{ marginTop: token.marginXL }}>
          <Link href="#" type="secondary">Terms</Link>
          <Link href="#" type="secondary">Privacy</Link>
          <Link href="#" type="secondary">Security</Link>
          <Link href="#" type="secondary">Contact</Link>
        </Space>
      </Flex>
    </Flex>
  );
}
import { useEffect, useState } from "react";
import './login.css';
import { Icon } from '@iconify/react';
import { supabase } from '@/integrations/supabase/client';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { Spin, Input, Button, Form, Typography, Checkbox, Divider, theme } from 'antd';
import { showError, showSuccess } from "@/utils/toast";

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { settings, isLoading: isLoadingSettings } = useSystemSettings();
  const logoUrl = settings.logo_url;
  const { token } = theme.useToken();

  // Prefill saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem('cmms:rememberedEmail');
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail });
      setRememberMe(true);
    }
  }, [form]);

  const handleLogin = async (values: { email: string; password: string; remember?: boolean }) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        showError(error.message);
        return;
      }
      // Remember email for convenience
      if (values.remember) {
        localStorage.setItem('cmms:rememberedEmail', values.email);
      } else {
        localStorage.removeItem('cmms:rememberedEmail');
      }
      // SessionProvider handles redirect on success
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email: string | undefined = form.getFieldValue('email');
    if (!email) {
      showError('Please enter your email first.');
      return;
    }
    try {
      setLoading(true);
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
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

  const handleOAuthSignIn = async () => {
    try {
      setOauthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) showError(error.message);
    } finally {
      setOauthLoading(false);
    }
  };

  const Logo = () => (
    <div className="mb-6">
      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
        {isLoadingSettings ? <Spin /> : logoUrl ? (
          <img src={logoUrl} alt="System Logo" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <Icon icon="ph:fire-fill" className="h-12 w-12 text-gray-500" />
        )}
      </div>
    </div>
  );

  return (
    <div className="login-bg flex flex-col items-center justify-center p-4">
      <div className="login-logo">
        <Logo />
      </div>
      <Typography.Title level={2} className="login-title" style={{ marginBottom: 4 }}>GOGO Electric</Typography.Title>
      <Typography.Paragraph className="login-subtitle" style={{ marginTop: 0 }}>GOGO Maintenance Management Platform</Typography.Paragraph>

      <div className="login-card" style={{ border: `1px solid ${token.colorBorderSecondary}` }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ remember: rememberMe }}
          disabled={loading || oauthLoading}
        >
          <Form.Item
            name="email"
            label="Email address"
            rules={[
              { required: true, message: 'Please enter your email.' },
              { type: 'email', message: 'Please enter a valid email.' },
            ]}
          >
            <Input
              prefix={<Icon icon="ph:envelope-fill" style={{ color: token.colorTextTertiary }} />}
              placeholder="you@example.com"
              size="large"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Password</span>
                <Button type="link" size="small" onClick={handleForgotPassword} style={{ padding: 0 }}>
                  Forgot password?
                </Button>
              </div>
            }
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <Input.Password
              prefix={<Icon icon="ph:lock-fill" style={{ color: token.colorTextTertiary }} />}
              placeholder="Your password"
              size="large"
              iconRender={(visible) => (visible ? <Icon icon="ph:eye-fill" width={20} height={20} /> : <Icon icon="ph:eye-slash-fill" width={20} height={20} />)}
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox onChange={(e) => setRememberMe(e.target.checked)}>Remember me</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{ fontWeight: 600, letterSpacing: 0.3 }}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>or</Divider>
        <Button
          icon={<Icon icon="logos:google-icon" width={18} height={18} />}
          onClick={handleOAuthSignIn}
          size="large"
          block
          loading={oauthLoading}
        >
          Continue with Google
        </Button>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 16 }}>
          <span style={{ color: 'var(--ant-colorTextSecondary)' }}>Don't have an account?</span>{' '}
          <a href="#" style={{ color: token.colorPrimary, fontWeight: 500 }}>Sign up</a>
        </div>
      </div>

      <footer className="login-footer">
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Security</a>
        <a href="#">Contact</a>
      </footer>
    </div>
  );
}
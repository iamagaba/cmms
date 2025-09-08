import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Typography, Space } from 'antd';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Login() {
  const { settings, isLoading } = useSystemSettings();
  const logoUrl = settings.logo_url;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Space direction="vertical" align="center" size="large">
            {isLoading ? null : logoUrl ? (
              <img src={logoUrl} alt="System Logo" style={{ height: '48px' }} />
            ) : (
              <FireOutlined style={{color: '#6A0DAD', fontSize: '48px'}} />
            )}
            <div>
              <Title level={3} style={{ color: '#6A0DAD', marginBottom: 0 }}>GOGO Electric</Title>
              <Text type="secondary">Sign in to your account</Text>
            </div>
          </Space>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6A0DAD',
                  brandAccent: '#6A0DAD',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
}

export default Login;
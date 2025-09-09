import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Typography, Spin } from 'antd';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Login() {
  const { settings, isLoading } = useSystemSettings();
  const logoUrl = settings.logo_url;

  const Logo = () => (
    <div className="mb-6">
      {isLoading ? <Spin /> : logoUrl ? (
        <img src={logoUrl} alt="System Logo" className="h-16 mx-auto" />
      ) : (
        <FireOutlined className="text-6xl text-[#6A0DAD]" />
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundImage: 'url(https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Logo />
          <Title level={2} className="!mb-1">GOGO Electric</Title>
          <Text type="secondary" className="block mb-8">GOGO Maintenance Management Platform</Text>
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
                  brandAccent: '#580b8e',
                },
                radii: {
                  inputBorderRadius: '8px',
                  buttonBorderRadius: '8px',
                },
              },
            },
            style: {
              button: {
                paddingTop: '12px',
                paddingBottom: '12px',
                fontWeight: '600',
              },
              input: {
                paddingTop: '12px',
                paddingBottom: '12px',
              },
              label: {
                fontWeight: '500',
              },
              message: {
                fontSize: '0.875rem',
              }
            }
          }}
          theme="light"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
}

export default Login;
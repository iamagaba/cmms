import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Typography, Space, Spin } from 'antd';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Login() {
  const { settings, isLoading } = useSystemSettings();
  const logoUrl = settings.logo_url;

  const Logo = ({ color, size }: { color: string; size: string }) => (
    <>
      {isLoading ? <Spin /> : logoUrl ? (
        <img src={logoUrl} alt="System Logo" style={{ height: size }} />
      ) : (
        <FireOutlined style={{ color: color, fontSize: size }} />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* Branding Panel */}
        <div className="w-1/2 bg-[#6A0DAD] text-white p-12 flex-col justify-center items-center hidden md:flex">
          <div className="text-center">
            <Logo color="white" size="64px" />
            <h1 className="text-4xl font-bold mt-4">GOGO Maintenance</h1>
            <p className="mt-2 text-purple-200">Service Platform</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Unified Header */}
          <div className="text-center md:text-left mb-8">
            <Title level={2} style={{ marginBottom: '4px' }}>Welcome Back</Title>
            <Text type="secondary">Please enter your details to sign in.</Text>
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
                    inputBorderRadius: '6px',
                    buttonBorderRadius: '6px',
                  },
                },
              },
              style: {
                button: {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                },
                input: {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                }
              }
            }}
            theme="light"
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
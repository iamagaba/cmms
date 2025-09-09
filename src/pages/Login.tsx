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
    <div className="mb-8">
      {isLoading ? <Spin /> : logoUrl ? (
        <img src={logoUrl} alt="System Logo" className="h-20 mx-auto" />
      ) : (
        <FireOutlined className="text-7xl text-[#6A0DAD]" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-12 rounded-2xl shadow-lg">
        <div className="text-center mb-12">
          <Logo />
          <Title level={2} className="!mb-2">GOGO Electric</Title>
          <Text type="secondary" className="block text-base">GOGO Maintenance Management Platform</Text>
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
                space: {
                  spaceSmall: '4px',
                  spaceMedium: '8px',
                  spaceLarge: '16px',
                  labelBottomMargin: '8px',
                  anchorBottomMargin: '8px',
                  emailInputSpacing: '8px',
                  socialAuthSpacing: '8px',
                  buttonPadding: '14px 20px',
                  inputPadding: '14px 20px',
                },
                fontSizes: {
                    baseInputSize: '16px',
                    baseLabelSize: '16px',
                }
              },
            },
            style: {
              button: {
                fontWeight: '600',
              },
              label: {
                fontWeight: '500',
              },
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
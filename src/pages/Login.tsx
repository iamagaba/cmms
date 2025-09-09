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

  const Logo = ({ color, size }: { color: string; size: string }) => (
    <>
      {isLoading ? <Spin /> : logoUrl ? (
        <img src={logoUrl} alt="System Logo" style={{ height: size, margin: '0 auto' }} />
      ) : (
        <FireOutlined style={{ color: color, fontSize: size }} />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Branding Panel */}
        <div className="w-1/2 bg-[#6A0DAD] text-white p-16 flex-col justify-center items-center hidden md:flex">
          <div className="text-center">
            <Logo color="white" size="80px" />
            <h1 className="text-5xl font-bold mt-6">GOGO Electric</h1>
            <p className="mt-3 text-lg text-purple-200">GOGO Maintenance Management Platform</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header for mobile and desktop */}
            <div className="text-center mb-10">
              <div className="md:hidden mb-6">
                 <Logo color="#6A0DAD" size="56px" />
              </div>
              <Title level={2} style={{ marginBottom: '8px' }}>Welcome Back</Title>
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
                  }
                }
              }}
              theme="light"
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
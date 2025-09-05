import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Typography } from 'antd';

const { Title, Text } = Typography;

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Title level={3} className="text-blue-600">GOGO Electric</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]} // You can add 'google', 'github', etc. here if you configure them in Supabase
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#1677ff',
                  brandAccent: '#1677ff',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin} // Redirect to the current origin after login
        />
      </div>
    </div>
  );
}

export default Login;
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
          <Title level={3} style={{ color: '#6A0DAD' }}>GOGO Electric</Title> {/* GOGO Brand Purple */}
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
                  brand: '#6A0DAD', // GOGO Brand Purple
                  brandAccent: '#6A0DAD', // GOGO Brand Purple
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
import React, { useState, useEffect } from 'react';
import { Layout, theme as antdTheme } from 'antd';
import { GlobalHeader } from '../GlobalHeader';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import SidebarNavigation from './SidebarNavigation';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const MOBILE_BREAKPOINT = 768;
const CONTENT_MAX_WIDTH = 1440;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { settings } = useSystemSettings();
  const { token } = antdTheme.useToken();
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);
  
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    setSidebarVisible(!isMobile);
    setCollapsed(isMobile);
  }, [isMobile]);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SidebarNavigation
        collapsed={collapsed}
        visible={sidebarVisible}
        onCollapse={setCollapsed}
        onClose={() => setSidebarVisible(false)}
        logo={settings?.logo_url}
        isMobile={isMobile}
      />
      
      <Layout>
        <GlobalHeader
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={collapsed}
          isMobile={isMobile}
        />
        
        <Content
          style={{
            padding: isMobile ? '16px' : '24px',
            backgroundColor: token.colorBgLayout,
          }}
        >
          <div
            style={{
              maxWidth: CONTENT_MAX_WIDTH,
              margin: '0 auto',
              padding: isMobile ? '16px' : '24px',
              backgroundColor: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              minHeight: '80vh',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
// src/types/antd-extended.d.ts

import 'antd';

declare module 'antd/es/theme/internal' {
  interface GlobalToken {
    colorSurface: string;
    colorSurfaceSubtle: string;
    colorTextAction: string;
    colorTextActionHover: string;
  }
}

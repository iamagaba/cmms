// Simple toast notification utilities using browser alerts as fallback
// This is a minimal implementation to replace the deleted notification system

export const showSuccess = (content: string) => {
  console.log('✅ Success:', content);
  // In a real app, you'd use a toast library like react-hot-toast or sonner
  // For now, we'll just log to console to avoid blocking the build
};

export const showError = (content: string) => {
  console.error('❌ Error:', content);
  // In production, integrate with a proper toast notification library
};

export const showWarning = (content: string) => {
  console.warn('⚠️ Warning:', content);
};

export const showInfo = (content: string) => {
  console.info('ℹ️ Info:', content);
};

export const showLoading = (content: string) => {
  console.log('⏳ Loading:', content);
  // Return a no-op function for API compatibility
  return () => { };
};

export const dismissToast = (close?: () => void) => {
  if (close) {
    close();
  }
};
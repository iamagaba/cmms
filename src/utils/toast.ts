import { message } from 'antd';

export const showSuccess = (content: string) => {
  message.success(content);
};

export const showError = (content: string) => {
  message.error(content);
};

export const showLoading = (content: string) => {
  // Ant Design's message.loading returns a function to close the message.
  // The second argument `0` makes it non-expiring until explicitly closed.
  return message.loading(content, 0);
};

export const dismissToast = (close?: () => void) => {
  // Expects the close function returned by showLoading
  if (close) {
    close();
  }
};
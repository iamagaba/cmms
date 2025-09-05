import { toast } from "sonner";

export const showSuccess = (content: string) => {
  toast.success(content);
};

export const showError = (content: string) => {
  toast.error(content);
};

// sonner doesn't have a direct equivalent of a non-expiring loading message
// that returns a closer function. We'll use a standard loading toast.
export const showLoading = (content: string): string | number => {
  return toast.loading(content);
};

// In sonner, you dismiss by the ID returned from the toast function.
export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    // Dismiss all toasts if no ID is provided
    toast.dismiss();
  }
};
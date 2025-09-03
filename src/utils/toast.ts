import { toast } from "sonner";

export const showSuccess = (content: string) => {
  toast.success(content);
};

export const showError = (content:string) => {
  toast.error(content);
};

export const showLoading = (content: string) => {
  return toast.loading(content);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
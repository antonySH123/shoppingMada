export type DialogOptions = {
  title: string;
  message: string;
  input?: { label: string; placeholder?: string; value?: string; required?: boolean; minLength?: number; maxLength?: number; pattern?: string };
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export type DialogRequest = DialogOptions & { kind: "alert" | "confirm" | "prompt" };
export type DialogResult = string | boolean | null | void;
export type DialogContextValue = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, options?: Partial<DialogOptions>) => Promise<boolean>;
  prompt: (message: string, options?: Partial<DialogOptions>) => Promise<string | null>;
};

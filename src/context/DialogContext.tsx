import { FormEvent, ReactNode, useCallback, useMemo, useRef, useState } from "react";
import AdminModal from "../components/admin/ui/Modal";
import AdminButton from "../components/admin/ui/Button";
import { DialogContext } from "./DialogContextInstance";
import type { DialogContextValue, DialogRequest, DialogResult } from "./dialogTypes";

export function DialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [inputValue, setInputValue] = useState("");
  const resolveRef = useRef<((result: DialogResult) => void) | null>(null);

  const finish = useCallback((result: DialogResult) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setRequest(null);
    setInputValue("");
  }, []);

  const open = useCallback((dialogRequest: DialogRequest): Promise<DialogResult> => {
    if (resolveRef.current) finish(false);
    setRequest(dialogRequest);
    setInputValue(dialogRequest.input?.value ?? "");
    return new Promise((resolve) => { resolveRef.current = resolve; });
  }, [finish]);

  const api = useMemo<DialogContextValue>(() => ({
    alert: async (message, title = "Information") => { await open({ kind: "alert", title, message, confirmLabel: "OK" }); },
    confirm: async (message, options = {}) => Boolean(await open({ kind: "confirm", title: "Confirmer l’action", message, confirmLabel: "Confirmer", cancelLabel: "Annuler", ...options })),
    prompt: async (message, options = {}) => {
      const result = await open({ kind: "prompt", title: "Saisie requise", message, confirmLabel: "Valider", cancelLabel: "Annuler", ...options });
      return typeof result === "string" ? result : null;
    },
  }), [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (request?.kind === "prompt") finish(inputValue);
    else finish(true);
  };

  return (
    <DialogContext.Provider value={api}>
      {children}
      <AdminModal open={Boolean(request)} title={request?.title ?? ""} onClose={() => finish(request?.kind === "confirm" ? false : undefined)} size="sm">
        {request && (
          <form onSubmit={submit} className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-6 text-[var(--admin-text)]">{request.message}</p>
            {request.kind === "prompt" && request.input && (
              <div className="admin-field">
                <label htmlFor="application-dialog-input">{request.input.label}</label>
                <input
                  id="application-dialog-input"
                  className="admin-field__control"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={request.input.placeholder}
                  required={request.input.required}
                  minLength={request.input.minLength}
                  maxLength={request.input.maxLength}
                  pattern={request.input.pattern}
                  autoFocus
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              {request.kind !== "alert" && <AdminButton type="button" variant="secondary" size="md" onClick={() => finish(request.kind === "confirm" ? false : null)}>{request.cancelLabel || "Annuler"}</AdminButton>}
              <AdminButton type="submit" variant={request.destructive ? "danger" : "primary"} size="md">{request.confirmLabel || "OK"}</AdminButton>
            </div>
          </form>
        )}
      </AdminModal>
    </DialogContext.Provider>
  );
}

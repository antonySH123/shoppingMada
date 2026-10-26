import { useMemo } from "react";
import JoditEditor from "jodit-react";
import { useContent } from "../../../../context/JoditEditorContext";

function Editor() {
  const { content, setNewContent } = useContent();
  const config = useMemo(
    () => ({
      height: 350,
      readonly: false,
      toolbar: true,
      pastePlainText: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_as_html" as const,
      processPasteHTML: true,
      spellcheck: true,
      toolbarSticky: false,
      placeholder: "Saisissez votre description détaillée ou collez votre texte ici…",
    }),
    [],
  );

  return (
    <div className="flex w-full flex-col gap-3">
      <label>Détails</label>
      <JoditEditor
        value={content}
        config={config}
        onChange={setNewContent}
        onBlur={setNewContent}
      />
      <p className="text-xs text-[var(--admin-muted)]">Vous pouvez écrire directement ou coller du texte depuis un document. La mise en forme collée est conservée puis nettoyée avant l’enregistrement.</p>
    </div>
  );
}

export default Editor;

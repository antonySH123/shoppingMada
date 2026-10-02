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
      />
    </div>
  );
}

export default Editor;

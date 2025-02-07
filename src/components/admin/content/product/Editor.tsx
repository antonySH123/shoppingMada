import JoditEditor from "jodit-react";
import { useContent } from "../../../../context/JoditEditorContext";

function Editor() {
  const { content, setNewContent } = useContent();
  const config = {
    height: "350",
    pastePlainText: false,
  };
  return (
    <div className="w-full flex gap-3 flex-col">
      <label>Détails</label>
      <JoditEditor
        value={content}
        config={config}
        onBlur={(newContent) => setNewContent(newContent)}
      />
    </div>
  );
}

export default Editor;

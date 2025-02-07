import React from "react";
type Props = {
  title: string;
  message: string;
  ok: () => void;
  onClose: (params: boolean) => void;
  isOpen: boolean;
};
const Dialog: React.FC<Props> = ({ title, message, ok, onClose, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <h1>{title}</h1>
        </div>
        <div className="mb-3">
          <p>{message}</p>
        </div>
        <div className=" flex flex-row justify-end gap-3">
          <button onClick={ok} className="bg-green-500 px-5 py-1 text-white rounded shadow">OK</button>
          <button onClick={() => onClose(false)} className="bg-red-500 px-5 py-1 text-white rounded shadow">Annulé</button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;

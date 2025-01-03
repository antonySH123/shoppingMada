import { MdOutlinePhonelinkRing } from "react-icons/md";
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from "react";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function RegisterConfirmation() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const { token } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Déplacer le curseur vers la case suivante si ce n'est pas la dernière
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && code[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const codeEntered = code.join(""); // Combiner le code en une seule chaîne
    console.log("Code entré : ", codeEntered);

    try {
      const response = await fetch(import.meta.env.REACT_API_URL + "email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ OTP: codeEntered }),
      });

      if (!response.ok) {
        console.log(await response.json());
        alert("Erreur de vérification. Veuillez réessayer.");
        return;
      }

      if (response.status === 201) {
        navigate("/profil");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Une erreur est survenue. Veuillez vérifier votre connexion.");
    }
  };

  // Utiliser useEffect pour surveiller le tableau `code`
  useEffect(() => {
    // Si tous les champs sont remplis, soumettre automatiquement
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]); // Déclencher l'effet lorsqu'un changement dans `code` est détecté

  return (
    <div className="container mx-auto px-20 w-full h-[100vh] flex flex-col justify-center overflow-y-auto bg-gray-100">
      <div className="mx-auto text-8xl">
        <MdOutlinePhonelinkRing />
      </div>
      <h3 className="text-center text-4xl font-semibold">Veuillez confirmer votre compte</h3>
      <p className="text-center mb-10 mt-5">
        Vérifiez votre téléphone pour voir le code de validation composé de 6 chiffres
      </p>
      <form
        className="px-96 py-10"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex gap-5">
          {code.map((digit, index) => (
            <div key={index} className="border h-16">
              <input
                type="text"
                className="w-full h-full text-5xl text-center py-2"
                value={digit}
                maxLength={1}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <button type="submit" name="valider" className="border h-10 w-20 bg-blue-500 text-white">
            Valider
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterConfirmation;

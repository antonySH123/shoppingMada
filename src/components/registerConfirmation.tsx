import { MdOutlinePhonelinkRing } from "react-icons/md";
import {
  useState,
  useRef,
  ChangeEvent,
  KeyboardEvent,
  FormEvent,
  useCallback,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useCSRF from "../helper/useCSRF";
import { toast } from "react-toastify";
import { useAuth } from "../helper/useAuth";


function RegisterConfirmation() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const csrf = useCSRF();
  const {user} = useAuth()


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

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

  const handleSubmit = useCallback(async () => {
    const codeEntered = code.join("");
    if (codeEntered.length < 6) {
      toast.error("Veuillez entrer le code complet.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (csrf) {
        const response = await fetch(
          import.meta.env.REACT_API_URL + "email/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify({ OTP: codeEntered }),
          }
        );

        setIsSubmitting(false);

        if (!response.ok) {
          const error = await response.json();
          toast.error(
            error.message || "Erreur de vérification. Veuillez réessayer."
          );
          return;
        }

        if (response.status === 201) {
          toast.success("Compte vérifié avec succès !");
          setTimeout(() => navigate("/profil"), 2000); // Delay before navigation
        }
      } else {
        toast.error("Erreur de sécurité. Veuillez réessayer.");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Erreur réseau :", error);
      toast.error(
        "Une erreur est survenue. Veuillez vérifier votre connexion."
      );
    }
  }, [code, csrf, navigate]);

  if(!user)
    return <Navigate to={"/login"}/>

  return (
    <div className="container mx-auto px-20 w-full h-[100vh] flex flex-col justify-center overflow-y-auto bg-gray-100">
      <div className="mx-auto text-8xl">
        <MdOutlinePhonelinkRing />
      </div>
      <h3 className="text-center text-4xl font-semibold">
        Veuillez confirmer votre compte
      </h3>
      <p className="text-center mb-10 mt-5">
        Vérifiez votre téléphone pour voir le code de validation composé de 6
        chiffres.
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
                disabled={isSubmitting} // Disable input during submission
              />
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <button
            type="submit"
            name="valider"
            className={`border h-10 w-20 text-white ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi..." : "Valider"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterConfirmation;

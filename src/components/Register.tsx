import { useReducer, ChangeEvent, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Iuser from "../Interface/UserInterface";
import validator from "../helper/Reg";
import { LiaUser } from "react-icons/lia";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import Preloader from "./loading/Preloader";

const initialState = {
  user: {
    username: "",
    email: "",
    password: "",
    phonenumber: "",
  } as Iuser,
  error: {} as Partial<Iuser>,
};
type Action =
  | { type: "SET_FIELD"; field: keyof Iuser; value: string }
  | { type: "SET_ERRORS"; errors: Partial<Iuser> }
  | { type: "RESET" };
function reducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        user: {
          ...state.user,
          [action.field]: action.value,
        },
        error: {
          ...state.error,
          [action.field]: "",
        },
      };
    case "SET_ERRORS":
      return {
        ...state,
        error: action.errors,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

function Register() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const csrf = useCSRF();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name as keyof Iuser, value });
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validator(state.user);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors });
      return;
    }

    setIsSubmitting(true); // Start loading animation
    try {
      if (!csrf) return;
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify(state.user),
        }
      );
      if (response.status === 401) {
        const result = await response.json();
        toast.warning(result.message);
      }
      if (response.status === 201) {
        const result = await response.json();
        toast.success(result.message);
        navigate("/login");
      }

      if (response.status === 400) {
        const result = await response.json();
        console.log(result.errors);
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue !");
    } finally {
      setIsSubmitting(false);
    }
  },[csrf, navigate, state.user])

  return (
    !csrf ? <Preloader/> :  <div className="text-white w-full h-[100vh] flex justify-center items-center bg-green-900 bg-[url('../src/assets/image/about/about.jpg')] bg-blend-multiply">
      <div>
        <div className="bg-green-950 w-fit md:w-[500px] border border-green-500 shadow-green-500 rounded-md px-8 py-5 shadow-lg backdrop-filter backdrop-blur relative">
          <h1 className="text-white flex flex-col justify-center items-center font-bold text-center mb-6 gap-3">
            <LiaUser size={60} />
            <strong className="text-2xl">S'inscrire</strong>
          </h1>
          <form onSubmit={handleSubmit}>
            {["username", "email", "phonenumber", "password"].map((field) => (
              <div className="relative my-4" key={field}>
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  onChange={handleChange}
                  value={state.user[field as keyof Iuser] as string}
                  className="block w-full py-4 px-0 text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                  placeholder={
                    field === "username"
                      ? "Votre nom"
                      : field === "email"
                      ? "Votre email"
                      : field === "phonenumber"
                      ? "Numéro de téléphone"
                      : "Votre mot de passe"
                  }
                />
                {state.error[field as keyof Iuser] && (
                  <strong className="text-red-400">
                    {state.error[field as keyof Iuser] as string}
                  </strong>
                )}
              </div>
            ))}

            <button
              className="w-full mb-4 text-[18px] mt-6 rounded-full bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white py-2 transition-colors flex justify-center items-center"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loader w-5 h-5 border-2 border-t-2 border-green-500 rounded-full animate-spin"></div>
              ) : (
                "S'inscrire"
              )}
            </button>
            <div className="flex justify-between items-center">
              <span className="m-4 flex gap-10">
                Déjà un compte ?
                <Link to="/login" className="text-green-500">
                  Se connecter
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div> 
   
  );
}

export default Register;

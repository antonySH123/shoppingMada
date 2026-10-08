import { useReducer, ChangeEvent, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Iuser from "../Interface/UserInterface";
import validator from "../helper/Reg";
import { LiaChevronLeftSolid, LiaUser } from "react-icons/lia";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";
import Preloader from "./loading/Preloader";
import { useLanguage } from "../context/useLanguage";

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
  const { t } = useLanguage();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const csrf = useCSRF();
  const handleBack = () => {
    if (location.state?.fromLogout) {
      navigate("/", { replace: true });
      return;
    }
    if (
      typeof window.history.state?.idx === "number" &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name as keyof Iuser, value });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
          },
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
          toast.error(
            result.message || "Veuillez v�rifier les informations saisies.",
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("Une erreur est survenue !");
      } finally {
        setIsSubmitting(false);
      }
    },
    [csrf, navigate, state.user],
  );

  return !csrf ? (
    <Preloader />
  ) : (
    <div className="auth-page auth-register-page relative flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="auth-panel auth-card w-full max-w-lg">
          <button
            type="button"
            onClick={handleBack}
            className="auth-back-button mb-6 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white/90 pr-4 pl-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <LiaChevronLeftSolid size={20} aria-hidden="true" /> {t("auth.back")}
          </button>
          <h1 className="text-white flex flex-col justify-center items-center font-bold text-center mb-6 gap-3">
            <LiaUser size={60} />
            <strong className="text-2xl">{t("auth.registerTitle")}</strong>
          </h1>
          <form onSubmit={handleSubmit}>
            {["username", "email", "phonenumber", "password"].map((field) => (
              <div className="relative my-4" key={field}>
                <input
                  type={
                    field === "password"
                      ? "password"
                      : field === "email"
                        ? "email"
                        : field === "phonenumber"
                          ? "tel"
                          : "text"
                  }
                  name={field}
                  onChange={handleChange}
                  value={state.user[field as keyof Iuser] as string}
                  className="market-input w-full"
                  placeholder={
                    field === "username"
                      ? t("auth.name")
                      : field === "email"
                        ? t("auth.email")
                        : field === "phonenumber"
                          ? t("auth.phone")
                          : t("auth.password")
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
                t("auth.register")
              )}
            </button>
            <div className="flex justify-between items-center">
              <span className="m-4 flex gap-10">
                {t("auth.alreadyAccount")}
                <Link to="/login" state={{ fromLogout: Boolean(location.state?.fromLogout) }} className="text-green-500">
                  {t("auth.signIn")}
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

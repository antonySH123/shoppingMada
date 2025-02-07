import { Navigate, useParams } from "react-router-dom";
import Iuser from "../../../Interface/UserInterface";
import { useCallback, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { LiaAtSolid, LiaPhoneAltSolid, LiaUser } from "react-icons/lia";
import useCSRF from "../../../helper/useCSRF";
import Dialog from "../../modals/Dialog";
import { useAuth } from "../../../helper/useAuth";

interface IState {
  user: Iuser | null;
  isActive: boolean | null;
  isOpen: boolean;
  title: string | null;
  message: string | null;
  action: (() => void) | null;
}

type Action =
  | { type: "FETCH_START"; payload: Iuser }
  | { type: "CHECK_ACCOUNT"; payload: boolean }
  | {
      type: "TOGGLE_DIALOG";
      payload: boolean;
      title: string;
      message: string;
      action: (() => void) | null;
    };

const initialState: IState = {
  user: null,
  isActive: null,
  isOpen: false,
  title: null,
  message: null,
  action: null,
};

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, user: action.payload };
    case "CHECK_ACCOUNT":
      return { ...state, isActive: action.payload };
    case "TOGGLE_DIALOG":
      return {
        ...state,
        isOpen: action.payload,
        title: action.title,
        message: action.message,
        action: action.action,
      };
    default:
      throw new Error();
  }
};

function AccountsDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const csrf = useCSRF();
  const close = () =>
    dispatch({
      type: "TOGGLE_DIALOG",
      payload: false,
      title: "",
      message: "",
      action: null,
    });
  const checkAccount = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}account/status/${id}`,
        {
          credentials: "include",
        }
      );

      if (response.status === 400) {
        dispatch({ type: "CHECK_ACCOUNT", payload: false });
      }

      if (response.status === 200) {
        dispatch({ type: "CHECK_ACCOUNT", payload: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [id]);
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}user/${id}`,
        {
          credentials: "include",
        }
      );
      const result = await response.json();
      if ((result.status as string).toLocaleLowerCase() === "success") {
        dispatch({ type: "FETCH_START", payload: result.data });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [id]);
  useEffect(() => {
    checkAccount();
    fetchData();
  }, [checkAccount, fetchData, id]);

  const handleSubmit = useCallback(async () => {
    let url = null;
    if (state.isActive === true)
      url = `${import.meta.env.REACT_API_URL}account/${id}/block`;
    if (state.isActive === false)
      url = `${import.meta.env.REACT_API_URL}account/${id}/active `;

    if (csrf) {
      const response = await fetch(url as string, {
        method: "PUT",
        credentials: "include",
        headers: {
          "xsrf-token": csrf,
        },
      });

      const resultat = await response.json();

      if ((resultat.status as string).toLocaleLowerCase() === "success") {
        toast.success(resultat.message);
        dispatch({
          type: "TOGGLE_DIALOG",
          payload: false,
          title: "",
          message: "",
          action: null,
        });
        checkAccount();
        fetchData();
      }
    }
  }, [checkAccount, csrf, fetchData, id, state.isActive]);

  const handleRoleChange = useCallback(async () => {
    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}account/${id}/admin`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "xsrf-token": csrf,
            },
          }
        );

        if (!response.ok) {
          toast.error("Une erreur est survenu!");
        }

        if (response.status === 201) {
          const result = await response.json();
          toast.success(result.message);
        }

        if (response.status === 403) {
          const result = await response.json();
          toast.warning(result.message);
        }
        dispatch({
          type: "TOGGLE_DIALOG",
          payload: false,
          title: "",
          message: "",
          action: null,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [csrf, id]);
  if (user?.userGroupMember_id.usergroup_id.name != "Super Admin") {
    return <Navigate to={"/espace_vendeur/dash"} />;
  }
  return (
    <div>
      <h1 className="text-2xl mb-3">Informations du compte</h1>
      <div className="border border-gray-300 py-5 px-5 flex justify-between gap-5 mb-7">
        <div className="flex gap-5">
          <img
            src="/src/assets/image/product/pharm.jpg"
            alt=""
            className="w-20 h-20 rounded-full"
          />
          <div>
            <strong className="flex items-center gap-3">
              {" "}
              <LiaUser /> {state.user?.username}
            </strong>
            <p className="flex items-center gap-3">
              {" "}
              <LiaAtSolid /> {state.user?.email}
            </p>
            <p className="flex items-center gap-3">
              {" "}
              <LiaPhoneAltSolid /> {state.user?.phonenumber}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <strong>{state.user?.userGroupMember_id && state.user?.userGroupMember_id.usergroup_id.name}</strong>
          {state.user?.userGroupMember_id && state.user?.userGroupMember_id.usergroup_id.name !==
            "Super Admin" && (
            <button
              className="px-3 py-1 bg-green-500 text-white text-sm rounded "
              onClick={() =>
                dispatch({
                  type: "TOGGLE_DIALOG",
                  payload: true,
                  action: handleRoleChange,
                  title: "Attribution de rôle administrateur",
                  message: `Êtes-vous sûr de definir ${state.user?.username} comme adminitrateur?`,
                })
              }
            >
              Définir commme admin
            </button>
          )}
        </div>
      </div>
      <div className="border border-gray-300 flex flex-col py-5 px-5">
        <h3>Informations générales</h3>
        <form
          action=""
          method="post"
          className="w-full flex justify-center mt-5 gap-10"
          aria-readonly="true"
        >
          <div className="w-full">
            <div className="mb-3">
              <label>Nom : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300 cursor-not-allowed"
                value={
                  state.user?.personnalInfo_id &&
                  state.user?.personnalInfo_id.firstName
                }
              />
            </div>
            <div className="mb-3">
              <label>Prenom : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300 cursor-not-allowed"
                value={
                  state.user?.personnalInfo_id &&
                  state.user?.personnalInfo_id.lastName
                }
              />
            </div>
            <div className="mb-3">
              <label>Telephone : </label>
              <input
                type="email"
                className="w-full px-2 py-2 border border-gray-300 cursor-not-allowed"
                value={
                  state.user?.personnalInfo_id &&
                  state.user?.personnalInfo_id.phoneNumber
                }
              />
            </div>
          </div>
          <div className="w-full">
            <div className="mb-3">
              <label>Genre : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300 cursor-not-allowed"
                value={
                  state.user?.personnalInfo_id &&
                  state.user?.personnalInfo_id.gender
                }
              />
            </div>
            <div className="mb-3">
              <label>CIN : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300 cursor-not-allowed"
                value={
                  state.user?.personnalInfo_id &&
                  state.user?.personnalInfo_id.cin
                }
                readOnly
              />
            </div>
            <div className="mb-3 w-full">
              <label>Adresse : </label>
              <input
                type="text"
                className="w-full px-2 py-2 border border-gray-300 cursor-not-allowed"
                value={
                  state.user?.personnalInfo_id &&
                  state.user?.personnalInfo_id.adresse
                }
              />
            </div>
          </div>
        </form>
      </div>
      <div className="border border-gray-300 py-5 px- mt-7 flex justify-end gap-5 mb-7">
        <form className="px-6">
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "TOGGLE_DIALOG",
                payload: true,
                title: "Confirmation",
                action: handleSubmit,
                message: `Vous êtes sur de ${
                  state.isActive === true ? "Desactiver" : "réactiver"
                } cette compte?`,
              })
            }
            className={`border ${
              state.isActive
                ? "border-red-500 bg-red-500"
                : "border-green-500 bg-green-500"
            } px-2 py-3 text-white font-semibold rounded`}
          >
            {state.isActive === true ? "Desactiver" : "Activer"}
          </button>
        </form>
      </div>
      <Dialog
        title={state.title as string}
        message={state.message as string}
        ok={state.action as () => void}
        onClose={close}
        isOpen={state.isOpen}
      />
    </div>
  );
}

export default AccountsDetails;

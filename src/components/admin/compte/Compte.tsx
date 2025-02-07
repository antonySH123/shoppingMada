import { Link, Navigate } from "react-router-dom";
import Iuser from "../../../Interface/UserInterface";
import React, { useCallback, useEffect, useReducer } from "react";
import { useAuth } from "../../../helper/useAuth";
import UserInfo from "../../modals/UserInfo";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";
import Skeleton from "react-loading-skeleton";

interface IState {
  users: Iuser[] | [];
  isOpen: boolean;
  newUser: Iuser | null;
  loading: boolean;
}

type Action =
  | { type: "FETCH_SUCCESS"; payload: Iuser[] }
  | { type: "FETCH_START" }
  | { type: "TOGGLE_MODAL"; payload: boolean }
  | { type: "CREATE_USER"; payload: Iuser | null }
  | { type: "LOADING"; payload: boolean };

const reducer = (state: IState, action: Action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading:true };
    case "FETCH_SUCCESS":
      return { ...state, loading:false, users:action.payload };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload };
    case "CREATE_USER":
      return { ...state, newUser: action.payload };
    case "LOADING":
      return { ...state, loading: action.payload };
    default:
      throw new Error("Action inconue");
  }
};

const initialState: IState = {
  users: [],
  isOpen: false,
  newUser: null,
  loading: false,
};
function Compte() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const csrf = useCSRF();

  const fetchUsers = useCallback(async () => {
    dispatch({type:"FETCH_START"});
    const response = await fetch(`${import.meta.env.REACT_API_URL}users`, {
      credentials: "include",
    });
    const { data } = await response.json();
    dispatch({ type: "FETCH_SUCCESS", payload: data });
  }, []);

  const closeModal = () => dispatch({ type: "TOGGLE_MODAL", payload: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: "CREATE_USER",
      payload: { ...state.newUser, [name]: value } as Iuser,
    });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch({ type: "LOADING", payload: true });
      try {
        if (csrf) {
          const response = await fetch(
            `${import.meta.env.REACT_API_URL}auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xsrf-token": csrf,
              },
              body: JSON.stringify(state.newUser),
              credentials: "include",
            }
          );

          if (response.ok) {
            const result = await response.json();
            toast.success(result.message);
            dispatch({ type: "TOGGLE_MODAL", payload: false });
            fetchUsers();
            dispatch({ type: "LOADING", payload: false });
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    },
    [csrf, fetchUsers, state.newUser]
  );
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (user?.userGroupMember_id.usergroup_id.name != "Super Admin") {
    return <Navigate to={"/espace_vendeur/dash"} />;
  }
  return (
    <>
      <div className="flex flex-col gap-5 p-4">
        <div className=" flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des comptes</h1>

          <button
            className="bg-green-500 px-3 py-2 rounded text-white"
            onClick={() => dispatch({ type: "TOGGLE_MODAL", payload: true })}
          >
            Nouveau compte
          </button>
        </div>
        <div className="shadow-md border rounded-lg overflow-auto">
          <table className="w-full border-collapse text-sm lg:text-base">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-3 border">#</th>
                <th className="py-3 border">Nom</th>
                <th className="py-3 border">telephone</th>
                <th className="py-3 border">Adresse Mail</th>
                <th className="py-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {state.users.length > 0 &&
                state.users.map((user, index) => (
                  <tr className="hover:bg-gray-50" key={index + 1}>
                    <td className="py-3 px-3 border text-center">
                      {state.loading ? (
                        <Skeleton className="w-10 h-10" />
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="py-3 px-3 border text-center">
                      {state.loading ? (
                        <Skeleton className="w-10 h-10" />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td className="py-3 px-3 border text-center">
                      {state.loading ? (
                        <Skeleton className="w-10 h-10" />
                      ) : (
                        user.phonenumber
                      )}
                    </td>
                    <td className="py-3 px-3 border text-center">
                      <span className="">
                        {state.loading ? (
                          <Skeleton className="w-10 h-10" />
                        ) : (
                          user.email
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 border text-center font-semibold">
                      
                      <Link
                        to={`/espace_vendeur/accountsSettings/${user._id}`}
                        className="text-green-500"
                      >
                        Voir plus
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <UserInfo isOpen={state.isOpen} onClose={closeModal}>
        <div>
          <h1 className="py-5 font-bold">Nouveau compte</h1>
        </div>
        <form action="" onSubmit={handleSubmit}>
          <input
            type="text"
            onChange={handleChange}
            name="username"
            placeholder="Nom d'utilisateur"
            className="px-3 py-2 rounded border mb-3 w-full"
          />
          <input
            type="email"
            onChange={handleChange}
            name="email"
            placeholder="Adresse mail"
            className="px-3 py-2 rounded border mb-3 w-full"
          />
          <input
            type="text"
            onChange={handleChange}
            name="phonenumber"
            placeholder="Téléphone"
            className="px-3 py-2 rounded border mb-3 w-full"
          />
          <input
            type="password"
            onChange={handleChange}
            name="password"
            placeholder="Mots de passe"
            className="px-3 py-2 rounded border mb-3 w-full"
          />
          <button
            className="px-3 py-2 rounded bg-green-500 text-white"
            type="submit"
          >
            {state.loading ? (
              <>
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm">veuillez patienter</span>
              </>
            ) : (
              <span className="text-sm uppercase">Enregistrer</span>
            )}
          </button>
        </form>
      </UserInfo>
    </>
  );
}

export default Compte;

import Isubscription from "../../../Interface/subscription.interface";
import IAction from "../../../Interface/action.interface";
import { useCallback, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { LiaEye } from "react-icons/lia";
import UserInfo from "../../modals/UserInfo";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";

interface IState {
  subscription: Isubscription[] | [];
  isOpen: boolean;
  selectedId: string | null;
  subscribeinfo: Isubscription | null;
  rejected: boolean;
  motif:string | null
}

const initialState: IState = {
  subscription: [],
  isOpen: false,
  selectedId: null,
  subscribeinfo: null,
  rejected: false,
  motif: null
};

const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        subscription: action.payload as Isubscription[],
        selectedId: null,
      };
    case "SELECT_ID":
      return { ...state, selectedId: action.payload as string };
    case "TOGGLE_MODAL":
      return { ...state, isOpen: action.payload as boolean, rejected: false };
    case "GET_INFO":
      return { ...state, subscribeinfo: action.payload as Isubscription };
    case "REJECTED":
      return { ...state, rejected: action.payload as boolean };
    case "HANDLE_MOTIF":
      return { ...state, motif: action.payload as string | null };
    default:
      throw new Error("Action inconnue!");
  }
};

function ListAbonnement() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const csrf = useCSRF();
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscription`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        if (response.status === 201)
          dispatch({ type: "FETCH_START", payload: result.data });
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  }, []);

  const getData = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.REACT_API_URL}subscription/${state.selectedId}`,
      {
        credentials: "include",
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (response.status === 201)
        dispatch({ type: "GET_INFO", payload: result.data });
    }
  }, [state.selectedId]);

  const updateData =useCallback( async (status: string) => {
    let data;
    if (user && user.userGroupMember_id.usergroup_id.name === "Boutiks") {
      data = {
        payementStatus: "Canceled",
      };
    } else {
      if (status === "Completed") {
        data = {
          payementStatus: "Completed",
          startDate: Date.now(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
      } else if (status === "Rejected") {
        data = {
          payementStatus: "Rejected",
          motif:state.motif
        };
      }
    }

    if (data && csrf) {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}subscribe/${state.selectedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "xsrf-token": csrf,
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (response.status === 201) {
          toast.success(result.message);
          dispatch({ type: "TOGGLE_MODAL", payload: false });
          fetchData();
        }
      }
      dispatch({type:"HANDLE_MOTIF",payload:null});
    }
  },[csrf, fetchData, state.motif, state.selectedId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (state.selectedId) getData();
  }, [getData, state.selectedId]);
  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-center text-3xl font-bold mb-6">
        Listes des abonnements
      </h1>
      <div className="shadow-md border rounded-lg overflow-auto">
        <table className="w-full border-collapse text-sm lg:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-3 border">Nom</th>
              <th className="py-3 border">Plan</th>
              <th className="py-3 border">Références</th>
              <th className="py-3 border">Status</th>
              <th className="py-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {state.subscription &&
              state.subscription.length > 0 &&
              state.subscription.map((item, index) => (
                <tr className="hover:bg-gray-50" key={index + 1}>
                  <td className="py-3 px-3 border text-center">
                    {item.owner_id.boutiks_id && item.owner_id.boutiks_id.name}
                  </td>
                  <td className="py-3 px-3 border text-center">{item.plan}</td>
                  <td className="py-3 px-3 border text-center">
                    {item.refTransaction}
                  </td>
                  <td className="py-3 px-3 border text-center">
                    {item.payementStatus}
                  </td>
                  <td className="py-3 px-3 border text-center">
                    <button
                      onClick={() => {
                        dispatch({ type: "SELECT_ID", payload: item._id });
                        dispatch({ type: "TOGGLE_MODAL", payload: true });
                      }}
                    >
                      <LiaEye />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <UserInfo
          isOpen={state.isOpen}
          onClose={() => dispatch({ type: "TOGGLE_MODAL", payload: false })}
        >
          <h1 className="text-xl font-bold mb-4">Abonnement details</h1>
          <hr />
          <div className="px-2 py-2 rounded w-full  border-green-500 border-2">
            {!state.rejected ? (
              <>
                <h2>{state.subscribeinfo?.owner_id.boutiks_id.name}</h2>
                <div className="flex flex-col gap-2">
                  <strong>{state.subscribeinfo?.plan}</strong>
                  <strong>{state.subscribeinfo?.payementStatus}</strong>
                  <strong>{state.subscribeinfo?.refTransaction}</strong>
                  <strong>{state.subscribeinfo?.transactionPhoneNumber}</strong>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1>Vous êtes sur de bien vouloir rejeter cette demande?</h1>
                  <input
                    type="text"
                    name="motif"
                    className="w-full px-2 py-2 rounded border"
                    placeholder="Motif"
                    value={state.motif as string}
                    onChange={(e)=>dispatch({type:"HANDLE_MOTIF",payload:e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          <hr />
          <div className="flex gap-3 py-3 justify-end">
            {user && user.userGroupMember_id.usergroup_id.name != "Boutiks" && (
              <>
                {!state.rejected ? (
                  <>
                    {" "}
                    <button
                      className="px-3 py-2 rounded bg-green-500 text-white"
                      onClick={() => updateData("Completed")}
                    >
                      Accepter
                    </button>
                    <button
                      className="px-3 py-2 rounded bg-red-500 text-white"
                      onClick={() =>
                        dispatch({ type: "REJECTED", payload: true })
                      }
                    >
                      Rejeter
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-3 py-2 rounded bg-green-500 text-white"
                      onClick={() => updateData("Rejected")}
                    >
                      Envoyer
                    </button>
                  </>
                )}
              </>
            )}

            {user &&
              user.userGroupMember_id.usergroup_id.name === "Boutiks" &&
              state.subscribeinfo?.payementStatus === "Pending" && (
                <button
                  className="px-3 py-2 rounded bg-red-500 text-white"
                  onClick={() => updateData("Canceled")}
                >
                  Annuler
                </button>
              )}
          </div>
        </UserInfo>
      </div>
    </div>
  );
}

export default ListAbonnement;

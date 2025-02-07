import React, { FormEvent, useCallback, useEffect, useReducer } from "react";
import { LiaCommentAltSolid, LiaPaperPlane } from "react-icons/lia";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
type CommentProps = {
  product_id: string;
  csrf: string;
};
interface IUser {
  _id: string;
  username: string;
}
interface IComment {
  _id?: string;
  comment: string;
  owner_id?: IUser;
  product_id?: string;
  date?: Date;
}

interface IState {
  id: string | null;
  comments: IComment[] | [];
  loading: boolean;
  newComment: IComment;
}

const initialState: IState = {
  id: null,
  comments: [],
  loading: false,
  newComment: { comment: "" },
};

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: IComment[] | IComment }
  | { type: "CHANGE_COMMENT"; payload: IComment };

const reducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        comments: action.payload as IComment[],
      };
    case "CHANGE_COMMENT":
      return { ...state, loading: false, newComment: action.payload };
    default:
      throw new Error("Une erreur est survenu");
  }
};
const Comment: React.FC<CommentProps> = ({
  product_id,
  csrf,
}: CommentProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "FETCH_START" });

    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}comment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify(state.newComment),
          }
        );

        if (response.ok && response.status === 201) {
          const result = await response.json();
          fetchComment();
          toast.success(result.message);
        }

        if (response.status === 401) {
          toast.error("Vous devez vous connecté tout d'abord!");
          navigate("/login", {
            state: {
              from: location.pathname,
            },
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  const fetchComment = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}comment/${product_id}`,
        {
          method: "GET",
        }
      );

      if (response.ok && response.status == 200) {
        const result = await response.json();
        console.log(result.data);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  },[product_id])
  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    fetchComment();
  }, [fetchComment, product_id, state.id]);
  return (
    <React.Fragment>
      <section>
        <div className=" py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Commentaires</h1>
            <p className="flex items-center gap-2 font-bold">
              <strong>{state.comments.length}</strong>
              <LiaCommentAltSolid />
            </p>
          </div>
          <hr />
          {state.comments.length > 0 ? (
            state.comments.map((element, index) => (
              <>
                <div key={index + 1} className="py-3 px-3">
                  <div className="flex gap-3 w-full items-center justify-between">
                    <h2>{element.owner_id?.username}</h2>
                    <strong className="text-sm">
                      {element.date && new Date(element.date).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <p>{element.comment}</p>
                  </div>
                </div>
                {state.comments.length - 1 != index && <hr />}
              </>
            ))
          ) : (
            <div className="py-3">
              <h1>Aucun commentaire</h1>
            </div>
          )}
          <hr />
          <form action="" className="py-3" onSubmit={handleSubmit}>
            <div className="w-full h-fit flex bg-green-500 rounded-full">
              <textarea
                name="comment"
                className="h-max min-h-10  rounded-full border px-5 py-2 w-full"
                value={state.newComment.comment}
                onChange={(e) =>
                  dispatch({
                    type: "CHANGE_COMMENT",
                    payload: {
                      ...state.newComment,
                      comment: e.target.value,
                      product_id,
                    },
                  })
                }
              ></textarea>
              <div className="w-15 relative top-0 right-0 bg-red-400">
                <button
                  type="submit"
                  className="absolute  right-0 bottom-[1.5px] h-16 w-16 flex items-center justify-center  rounded-full text-gray-700"
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
                    </>
                  ) : (
                    <LiaPaperPlane size={30} />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </React.Fragment>
  );
};

export default Comment;

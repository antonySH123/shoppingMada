import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import React, { useState } from "react";
import { LiaUserSolid } from "react-icons/lia";
import { toast } from "react-toastify";
function Login() {
  const { setUserInfo, setToken } = useAuth();
  const [userAuth, setUserAuth] = useState({ emailOrPhone: "", password: "" });
  const [isSubmited, setIsSubmited] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsSubmited(true);
    event.preventDefault();
    try {
      const postdata = await fetch(
        `${import.meta.env.REACT_API_URL}auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify(userAuth),
        }
      );

      const response = await postdata.json();
      if (response.status === "Failed") {
        toast.error(response.message);
      }

      if (response.status === "Success") {
        const { token } = response.userInfo;
        setToken(token);
        setUserInfo(response.userInfo);
        navigate("/profil");
      }
    } catch (error) {
      toast.error(new Error(error).message);
    }
    setIsSubmited(false);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserAuth((prevAuthUser) => ({ ...prevAuthUser, [name]: value }));
  };

  return (
    <div className="text-white w-full h-[100vh] flex justify-center items-center bg-green-900 bg-[url('../src/assets/image/about/about.jpg')] bg-blend-multiply">
      <div>
        <div className="bg-green-950  shadow-xl border border-green-500 shadow-green-500 rounded-md p-8  backdrop-filter backdrop-blur-sm  relative">
          <h1 className="text-white font-bold text-center mb-6 flex flex-col justify-center items-center">
            <LiaUserSolid size={60} />
            <strong className="text-2xl">Se connecter</strong>
          </h1>
          <form action="" method="post" onSubmit={handleSubmit}>
            <div className="relative my-4">
              <input
                type="email"
                name="emailOrPhone"
                value={userAuth.emailOrPhone}
                onChange={handleChange}
                id=""
                className="block w-72 py-5  px-0  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                placeholder="Votre email"
                disabled={isSubmited}
              />
              <label
                htmlFor=""
                className="absolute  text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:left-0  peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              ></label>
            </div>
            <div className="relative my-4">
              <input
                type="password"
                name="password"
                id=""
                value={userAuth.password}
                onChange={handleChange}
                className="block w-72 py-5 px-0  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                placeholder="Votre mot de passe"
                disabled={isSubmited}
              />
              <label
                htmlFor=""
                className="absolute  text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:left-0  peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              ></label>
            </div>
            <div className="flex justify-between items-center">
              <Link to="" className="text-green-500">
                Mot de passe oublié
              </Link>
            </div>
            <button
              className="w-full mb-4 text-[18px] mt-6 rounded-full bg-emerald-600 text-white shadow shadow-emerald-600 hover:bg-emerald-600 hover:text-white py-2 transition-colors"
              type="submit"
              disabled={isSubmited}
            >
              {isSubmited ?  <>
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
              </> : <span className="text-sm uppercase">Se connecter</span> }
              
            </button>
            <div className="flex justify-between items-center">
              <span className="m-4 flex gap-10">
                Pas de compte ?
                <Link to="/register" className="text-green-500">
                  S'inscrire
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Iuser from "../Interface/UserInterface";
import { useAuth } from "../context/UserContext";
import validator from "../helper/Reg";
import { LiaUser } from "react-icons/lia";
// import { regEmail, regNom, regPhone } from "../helper/Reg";

function Register() {
  const [user, setUser] = useState<Iuser>({
    username: "",
    email: "",
    password: "",
    phonenumber: "",
  });
  const [error, setError] = useState<Partial<Iuser>>({});
  const navigate = useNavigate();
  const { setUserInfo, setToken } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => {
      if (prevUser) {
        return {
          ...prevUser,
          [name]: value,
        };
      }
      return prevUser;
    });

    setError((prevError) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorvalidator = validator(user);
    setError(errorvalidator);

    if (Object.keys(errorvalidator).length == 0) {
      try {
        console.log(user);

        const response = await fetch(
          import.meta.env.REACT_API_URL + "auth/register",
          {
            method: "post",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420",
            },
            body: JSON.stringify(user),
          }
        );
        if (!response.ok) {
          console.log("Erreur");
        }
        if (response.status === 201) {
          const result = await response.json();
          setUserInfo(result.userInfo);
          setToken(result.userInfo.token);
          navigate("/confirmCompte");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div
      className="text-white w-full h-[100vh] flex justify-center items-center bg-green-900 bg-[url('../src/assets/image/about/about.jpg')] bg-blend-multiply"
      
    >
      <div>
        <div className="bg-green-950 w-[500px] border border-green-500  shadow-green-500 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur relative">
          <h1 className=" text-white flex flex-col justify-center items-center font-bold text-center mb-6 gap-3">
            <LiaUser size={60}/>
            <strong className="text-2xl">S'inscrire</strong>
          </h1>
          <form action="" method="post" onSubmit={handleSubmit}>
            <div className="relative my-4">
              <input
                type="text"
                name="username"
                onChange={handleChange}
                value={user?.username}
                className="block w-full py-4 px-0  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                placeholder="Votre nom"
              />
              <label
                htmlFor=""
                className="absolute  text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:left-0  peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              ></label>
              {error.username && <strong className="text-red-400">{error.username}</strong>}
            </div>
            <div className="relative my-4">
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={user?.email}
                className="block w-full py-4 px-0  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                placeholder="Votre email"
              />
              <label
                htmlFor=""
                className="absolute  text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:left-0  peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              ></label>
              {error.email && <strong className="text-red-400">{error.email}</strong>}
            </div>
            <div className="relative my-4">
              <input
                type="text"
                name="phonenumber"
                onChange={handleChange}
                value={user?.phonenumber}
                className="block w-full py-4 px-0  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                placeholder="Numero de telephone"
              />
              <label
                htmlFor=""
                className="absolute  text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:left-0  peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              ></label>
              {error.phonenumber && <strong className="text-red-400">{error.phonenumber}</strong>}
            </div>
            <div className="relative my-4">
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={user?.password}
                className="block w-full py-4 px-0  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer"
                placeholder="Votre mot de passe"
              />
              <label
                htmlFor=""
                className="absolute  text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-focus:left-0  peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              ></label>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <input type="checkbox" name="" id="" />
                <label htmlFor="Se souvenir de moi">Se souvenir</label>
              </div>
              <Link to="" className="text-green-500">
                Mot de passe oublié
              </Link>
            </div>
            <button
              className="w-full mb-4 text-[18px] mt-6 rounded-full bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white py-2 transition-colors"
              type="submit"
            >
              S'inscrire
            </button>
            <div className="flex justify-between items-center">
              <span className="m-4 flex gap-10">
                Deja un compte ?
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

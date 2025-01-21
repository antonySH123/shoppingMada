import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { FaRegSun, FaShoppingCart, FaSun, FaUsers } from "react-icons/fa";
import UserInfo from "../../modals/UserInfo";
import { LiaUploadSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";

function Dash() {
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const closeModal = () => setIsModalOpen(false);
  const [cin, setCIN] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputFile = useRef<HTMLInputElement | null>(null)
  

  const handleSubmit = async(e: FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append('cin',cin);
    files.forEach((image)=>{
      formData.append("image", image);
    })
    const response = await fetch(`${import.meta.env.REACT_API_URL}personnal/info`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if(!response.ok){
      toast.error("Une erreur s'est produite! ")
    }

    const success = await response.json();

    console.log(success);
    toast.success(success.message);
    setIsModalOpen(false);

  }

  const getPersonnalInfo = useCallback(async () => {
    if (!token) {
      console.error("Token is missing.");
      return;
    }

    const response = await fetch(
      `${import.meta.env.REACT_API_URL}personnal/info`,
      {
        headers: {
          "Content-Type": "application/json",
          // Accept: "application/json",
          "ngrok-skip-browser-warning": "69420",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if(!result.data.cin) setIsModalOpen(true)
  }, [token]);

  useEffect(() => {
    if (token) getPersonnalInfo();
  }, [getPersonnalInfo, token, user]);
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-5">
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            <FaShoppingCart className="text-5xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-[20px]">150</h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">Produits</h1>
          </div>
        </div>
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            <FaSun className="text-5xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-[20px]">10</h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">
              Categories
            </h1>
          </div>
        </div>
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            <FaUsers className="text-5xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-[20px]">20</h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">
              Utilisateurs
            </h1>
          </div>
        </div>
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            <FaRegSun className="text-5xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-[20px]">18</h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">
              Sous categories
            </h1>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mt-10 gap-10 py-5">
        <div className="shadow-md rounded-lg py-3 px-5">
          <div className="py-5 text-2xl">
            <h1>Listes des clients potentiel</h1>
          </div>
          <div className="overflow-auto">
            <table className="w-full border-2">
              <thead className="bg-green-500 text-white text-left">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3">Nom</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Adresse</th>
                  <th className="py-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-500">
                <tr>
                  <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3">
                    1
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">Rakoto</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    rakoto@gmail.com
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">67ha</td>
                  <td className="py-3 pr-6 whitespace-nowrap">0320255505</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3">
                    2
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">Lita</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    lita@gmail.com
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">Anosy</td>
                  <td className="py-3 pr-6 whitespace-nowrap">0320255505</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3">
                    3
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">bema</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    bema@gmail.com
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">Tanjombato</td>
                  <td className="py-3 pr-6 whitespace-nowrap">0320255505</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3">
                    4
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">John</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    john@gmail.com
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">Alasora</td>
                  <td className="py-3 pr-6 whitespace-nowrap">0320255505</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3">
                    5
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">Rita</td>
                  <td className="py-3 pr-6 whitespace-nowrap">
                    rita@gmail.com
                  </td>
                  <td className="py-3 pr-6 whitespace-nowrap">67ha</td>
                  <td className="py-3 pr-6 whitespace-nowrap">0320255505</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Informations pérsonnels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          <form action="" method="post" encType="multpart/form-data" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="rounded w-full border border-green-500 py-3  px-3 mb-3"
                placeholder="Votre CIN"
                name="cin"
                value={cin}
                onChange={(e)=> setCIN(e.target.value)}
              />

              <div className="flex gap-2">
                {files.length > 0 && (
                  <ul className="flex gap-2">
                  {files &&
                    files.map((file, index) => (
                      <li key={index} className="mb-2">
                        {file.type.startsWith("image/") && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            
                          </div>
                        ) }
                      </li>
                    ))}
                </ul>
                )}
                <div className="w-16 h-16 border-2 shadow rounded-sm flex flex-col justify-center items-center" onClick={()=>{
                  inputFile?.current?.click();
                }}>
                  <LiaUploadSolid/> <span className="text-[4px]">choisir une fichier</span>
                </div>
                <input
                ref={inputFile}
                  hidden
                  type="file"
                  name="image"
                  id=""
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
                  }}
                  multiple
                />
              </div>
            </div>

            <div>
              <button type="submit">Valider</button>
            </div>
          </form>
        </div>
      </UserInfo>
    </>
  );
}

export default Dash;

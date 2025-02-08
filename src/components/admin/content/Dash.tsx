import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { FaShoppingCart, FaSun, FaUsers } from "react-icons/fa";
import UserInfo from "../../modals/UserInfo";
import { LiaUploadSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { useAuth } from "../../../helper/useAuth";
import useCSRF from "../../../helper/useCSRF";
import IProduct from "../../../Interface/IProduct";
import ICommande from "../../../Interface/command.interfaces";
import ListAbonnement from "../abonnements/ListAbonnement";
import Iuser from "../../../Interface/UserInterface";

function Dash() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const closeModal = () => setIsModalOpen(false);
  const [cin, setCIN] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputFile = useRef<HTMLInputElement | null>(null);
  const csrf = useCSRF();
  const [products, setProduct] = useState<IProduct[]>();
  const [commandes, setCommandes] = useState<ICommande[]>();
  const [users,setUsers] = useState<Iuser[]>();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("cin", cin);
    files.forEach((image) => {
      formData.append("image", image);
    });
    if (csrf) {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}personnal/info`,
        {
          method: "PUT",
          headers: {
            "xsrf-token": csrf,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error("Une erreur s'est produite! ");
      }

      const success = await response.json();

      console.log(success);
      toast.success(success.message);
      setIsModalOpen(false);
    }
  };

  const getPersonnalInfo = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.REACT_API_URL}personnal/info`,
      {
        headers: {
          "Content-Type": "application/json",
          // Accept: "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (!result.data.cin) setIsModalOpen(true);
  }, []);

  const getProduct = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.REACT_API_URL}boutiks/product`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }
      if (response.status == 200) {
        const result = await response.json();
        setProduct(result.data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, []);

  const fetchCommand = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}command`, {
        credentials: "include",
      });

      const result = await response.json();
      console.log(result);

      if (response.status === 200) setCommandes(result.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}users`, {
        credentials: "include",
      });

      const result = await response.json();

      if (response.status === 200) setUsers(result.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    getPersonnalInfo();
    getProduct();
    fetchCommand();
  }, [fetchCommand, fetchUsers, getPersonnalInfo, getProduct, user]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            {users? <FaShoppingCart className="text-5xl text-orange-500" /> : <FaUsers className="text-5xl text-orange-500" />}
          </div>
          <div>
            <h1 className="text-[20px]">{user && user.userGroupMember_id.usergroup_id.name ==="Super Admin"? users?.length: products?.length}</h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">{user && user.userGroupMember_id.usergroup_id.name ==="Super Admin"? "Utilisateurs":"Product"}</h1>
          </div>
        </div>
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            <FaSun className="text-5xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-[20px]">
              {user && user.userGroupMember_id.usergroup_id.name ==="Super Admin"? users?.filter((item)=> item.userGroupMember_id?.usergroup_id.name=== "Boutiks").length: commandes?.map((item) => item.status === "Pending").length}
            </h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">
              {user && user.userGroupMember_id.usergroup_id.name ==="Super Admin"?"Nombres des boutiques":"Commande en Attente"}
            </h1>
          </div>
        </div>
        <div className="shadow-lg w-full h-auto bg-gray-100 flex flex-col justify-center items-center gap-3 py-5">
          <div>
            <FaUsers className="text-5xl text-orange-500" />
          </div>
          <div>
            <h1 className="text-[20px]">
            {user && user.userGroupMember_id.usergroup_id.name ==="Super Admin"? users?.filter((item)=> item.userGroupMember_id.usergroup_id.name=== "Client").length: commandes?.map((item) => item.status === "Pending").length}
            </h1>
          </div>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">
            {user && user.userGroupMember_id.usergroup_id.name ==="Super Admin"?"Nombres des Abonné":"Tous les commandes"}
              
            </h1>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 mt-10 gap-10 py-5">
        <div className="shadow-md rounded-lg py-3 px-5">
          {user && user.userGroupMember_id.usergroup_id.name === "Boutiks" ? (
            <>
              <div className="py-5 text-2xl">
                <h1>Listes des commandes en attente</h1>
              </div>
              <div className="overflow-auto">
                <table className="w-full border-2">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-3 px-3 border">#</th>
                      <th className="py-3 border">Produits</th>
                      <th className="py-3 border">Prix</th>
                      <th className="py-3 border">Quantité</th>
                      <th className="py-3 border">Variant</th>
                      <th className="py-3 border">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-500">
                    {commandes?.map((element, index) => (
                      <tr className="hover:bg-gray-50" key={index + 1}>
                        <td className="py-3 px-3 border text-center">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3 border text-center">
                          {element.product_id && element.product_id.name}
                        </td>
                        <td className="py-3 px-3 border text-center">
                          {element.product_id && element.product_id.price}
                        </td>
                        <td className="py-3 px-3 border text-center">
                          {element.quantity}
                        </td>
                        <td className="py-3 px-3 border text-center">
                          <ul>
                            {Object.entries(element.variants).map(
                              ([key, value]) => (
                                <li key={key + 1}>
                                  {key} : {value}
                                </li>
                              )
                            )}
                          </ul>
                        </td>
                        <td className="py-3 px-3 border text-center text-yellow-500">
                          {element.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ListAbonnement />
          )}
        </div>
      </div>

      <UserInfo isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Informations pérsonnels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          <form
            action=""
            method="post"
            encType="multpart/form-data"
            onSubmit={handleSubmit}
          >
            <div className="mb-3">
              <input
                type="text"
                className="rounded w-full border border-green-500 py-3  px-3 mb-3"
                placeholder="Votre CIN"
                name="cin"
                value={cin}
                onChange={(e) => setCIN(e.target.value)}
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
                          )}
                        </li>
                      ))}
                  </ul>
                )}
                <div
                  className="w-16 h-16 border-2 shadow rounded-sm flex flex-col justify-center items-center"
                  onClick={() => {
                    inputFile?.current?.click();
                  }}
                >
                  <LiaUploadSolid />{" "}
                  <span className="text-[4px]">choisir une fichier</span>
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

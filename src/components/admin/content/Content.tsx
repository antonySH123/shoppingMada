import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import IProduct from "../../../Interface/IProduct";
import { LiaEdit, LiaEye, LiaTrashAltSolid } from "react-icons/lia";
import Dialog from "../../modals/Dialog";
import { toast } from "react-toastify";
import useCSRF from "../../../helper/useCSRF";

function Content() {
  const csrf = useCSRF();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [title, setTitle] = useState("Confirmation");
  const close = () => setOpenDialog(false);
  const [products, setProduct] = useState<IProduct[]>();
  const fetchData = useCallback(async () => {
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

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const handleDeleteProduct = async () => {
    try {
      if (csrf) {
        const response = await fetch(
          `${import.meta.env.REACT_API_URL}shop/product/${selectedProductId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "xsrf-token": csrf,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          toast.success("Produit supprimé avec succès!");
          setOpenDialog(false);
          fetchData(); // Rafraîchir la liste des produits après suppression
        } else {
          toast.error("Une erreur s'est produite lors de la suppression.");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur serveur, veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetchData();
  },[fetchData]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 py-5">
      <div className="py-5">
        <h1 className="text-3xl">Nos produits</h1>
      </div>
      <div className="py-5 w-full flex justify-end">
        <Link
          to="/espace_vendeur/admin/addProduct"
          className="border px-3 py-2 bg-green-500 text-white rounded-md"
        >
          Nouveau produit
        </Link>
      </div>
      <div className="overflow-auto">
        <table className="w-full border-2">
          <thead>
            <tr>
              <th className="py-3 px-3">#</th>
              <th className="py-3">Produits</th>
              <th className="py-3">Déscription</th>
              <th className="py-3">Prix</th>
              <th className="py-3">Stock</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products &&
              products.length > 0 &&
              products?.map((element, index) => {
                return (
                  <tr key={index}>
                    <td className="py-3 pr-6 whitespace-nowrap font-semibold px-3 text-center">
                      {index + 1}
                    </td>
                    <td className="py-3 pr-6 whitespace-nowrap text-center">
                      {element.name}
                    </td>
                    <td className="py-3 pr-6 whitespace-nowrap text-center">
                      {element.description.slice(0,50)} { element.description.length > 50 && "..."}
                    </td>
                    <td className="py-3 pr-6 whitespace-nowrap text-center">
                      {element.price}
                    </td>
                    <td className="py-3 pr-6 whitespace-nowrap text-center">
                      {element.stock}
                    </td>
                    <td className="flex justify-center items-center py-5 gap-1">
                      <Link
                        to={element._id}
                        className="w-10 h-10 bg-blue-500 flex items-center justify-center rounded text-white"
                      >
                        <LiaEye />
                      </Link>
                      <Link
                        to={`/espace_vendeur/admin/addProduct/${element._id}`}
                        className="w-10 h-10 border border-green-500 flex items-center justify-center rounded text-green-500"
                      >
                        <LiaEdit />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedProductId(element._id);
                          setTitle("Êtes-vous sûr!");
                          setOpenDialog(true);
                        }}
                        className="w-10 h-10 border border-red-500 flex items-center justify-center rounded text-red-500"
                      >
                        <LiaTrashAltSolid />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <Dialog
        title={title}
        message={""}
        ok={handleDeleteProduct}
        onClose={close}
        isOpen={openDialog}
      />
    </div>
  );
}

export default Content;

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Select from "react-select";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function Vendeur() {
  const { setUserInfo, setToken,token } = useAuth();
  const navigate = useNavigate();
 
  const [boutik, setBoutik] = useState({
    name: "",
    adresse: "",
    phoneNumber: "",
    email: "",
    logo: (null as File) || File,
    product_category: [],
    issuer:""
  });
  const [option, setOption] = useState([]);
  const fetchData = useCallback(async () => {
    const data = await fetch(
      `${import.meta.env.REACT_API_CATEGORY_URL}all/category`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "69420",
          "Content-Type": "application/json",
        },
      }
    );

    if (data.ok) {
      const result = await data.json();
      const datas = result.category.map((element) => ({
        value: element._id,
        label: element.slug,
      }));
      setOption(datas);
    }
  }, []);

  const inputFile = useRef(null);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", boutik.name);
    formData.append("adresse", boutik.adresse);
    formData.append("phoneNumber", boutik.phoneNumber);
    formData.append("email", boutik.email);
    formData.append("issuer",boutik.issuer);
    if (boutik.logo) {
      formData.append("image", boutik.logo);
    }
    // Ajouter les catégories sélectionnées (converties en tableau de valeurs)
    boutik.product_category.forEach((category, index) => {
      formData.append(`product_category[${index}]`, category.value);
    });

    console.log(boutik);

    const promiseData = new Promise((resolve, reject) => {
      fetch(`${import.meta.env.REACT_API_URL}boutiks/store`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }).then((response) => {
        if (!response.ok) {
          reject("failed to create bootiks");
        } else {
          return response.json();
        }
      }).then(data => {
        resolve(data.message)
      }).catch(error => {
        reject(error.message)
      });
    });

    toast.promise(promiseData,{
      pending:"Envoi en cours...",
      success:{
        render({data}){    
          navigate("/redirect");
          return data
        }
      },
      error:{
        render({data})
        {
          return data
        }
      }
    })
    
  };
  const handleClick = () => {
    inputFile?.current?.click();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBoutik((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selected) => {
    setBoutik((prev) => ({ ...prev, product_category: selected }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file: any = event.target.files?.[0] || null;
    setBoutik((prev) => ({ ...prev, logo: file }));
  };

  return (
    <form action="" method="post" onSubmit={handleSubmit}>
      <section className="bg-green-900/50 bg-[url('/src/assets/image/banner/banner.jpg')] h-72 bg-center bg-cover bg-blend-color-burn bg-no-repeat flex justify-center items-center">
        <h1 className="text-center text-4xl uppercase text-white font-semibold">
          Devenir vendeur
        </h1>
      </section>
      <section>
        <div className="container mx-auto px-3">
          <h2 className="text-xl font-semibold my-5">
            Informations de la boutique
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 px-5">
            <div>
              <input
                type="text"
                name="name"
                value={boutik.name}
                onChange={handleInputChange}
                placeholder="Nom de la boutique"
                className="rounded w-full border border-green-500 py-5  px-3 mb-3"
              />
              <input
                type="text"
                name="adresse"
                value={boutik.adresse}
                onChange={handleInputChange}
                placeholder="Adresse"
                className="rounded w-full border border-green-500 py-5  px-3 mb-3"
              />
              <input
                type="text"
                name="phoneNumber"
                value={boutik.phoneNumber}
                onChange={handleInputChange}
                placeholder="Telephone"
                className="rounded w-full border border-green-500 py-5  px-3 mb-3"
              />
              <input
                type="email"
                name="email"
                value={boutik.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="rounded w-full border border-green-500 py-5  px-3 mb-3"
              />
               <input
                type="text"
                name="issuer"
                value={boutik.issuer}
                onChange={handleInputChange}
                placeholder="NIF/STAT"
                className="rounded w-full border border-green-500 py-5  px-3 mb-3"
              />

              <Select
                options={option}
                isMulti
                isClearable
                name="product_category"
                value={boutik.product_category}
                onChange={handleSelectChange}
              />
            </div>

            <div className="px-5">
              <div
                className="bg-white/50 h-full w-full shadow rounded flex justify-center relative cursor-pointer"
                onClick={handleClick}
              >
                <input
                  type="file"
                  name="logo"
                  id=""
                  className="absolute hidden"
                  onChange={handleFileChange}
                  ref={inputFile}
                />
                <FaCloudUploadAlt className=" my-auto font-bold w-16 h-16 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="py-5 px-8">
          <button
            type="submit"
            name="valider"
            className="bg-green-500 text-white text-lg py-5 w-full rounded-md"
          >
            Envoyer
          </button>
        </div>
      </section>
    </form>
  );
}

export default Vendeur;

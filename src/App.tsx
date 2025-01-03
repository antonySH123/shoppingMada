import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import "./App.css";
import Base from "./components/layouts/Base";
import Contact from "./components/Contact";
import Register from "./components/Register";
import Login from "./components/Login";
import BaseShop from "./components/layouts/BaseShop";
import Shop from "./components/shop/Shop";
// import Sidebar from "./components/shop/Sidebar"
import Vendeur from "./components/Vendeur";
import registerConfirmation from "./components/registerConfirmation";
import AppAdmin from "./components/admin/AppAdmin";
import Profil from "./components/Profil";
import Content from "./components/admin/content/Content";
import Dash from "./components/admin/content/Dash";
import ChangeUser from "./components/ChangeUser";
import Logout from "./auth/Logout";
import Add from "./components/admin/content/product/Add";
import ProtectedRoute from "./context/ProtectedRoute";
function App() {

  console.log(import.meta.env.REACT_API_URL);
  return (
    <BrowserRouter>
      {/* on utilise browserRouter pour definir nos route avec react-router-dom */}
      <Routes>
        {/* Routes permet de contenir les contenu utilisé */}
        <Route path="" Component={Base}>
          {/* Route definit les section comme yeld de laravel utilisé sur react
          on peut utilisé plusieurs Route */}
          <Route path="" index Component={Home} />
          {/* <Route path="/register" Component={Register}/> */}
          <Route path="/contact" Component={Contact} />
          <Route path="/vendeur" Component={Vendeur} />
          <Route path="/profil" Component={Profil} />
          <Route path="/redirect" Component={ChangeUser} />
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/confirmCompte" Component={registerConfirmation} />
        <Route path="/logout" Component={Logout} />

        {/* <Route path="/sidebar" Component={Sidebar}/> */}

        {/* routes qui gère tous les shop */}
        <Route path="" Component={BaseShop}>
          <Route path="/shop" Component={Shop} />
        </Route>

        {/* Route pour les administrateurs */}
        <Route
          path="/espace_vendeur"
          element={
            <ProtectedRoute role="Boutiks">
              <AppAdmin />
            </ProtectedRoute>
          }
        >
          {/* <Route path="/sidebar" Component={Sidebar}/> */}
          <Route path="dash" Component={Dash}></Route>
          <Route path="products" Component={Content}></Route>
          <Route path="admin/addProduct" Component={Add}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

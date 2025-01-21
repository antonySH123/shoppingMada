import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import "./App.css";
import Base from "./components/layouts/Base";
import Contact from "./components/Contact";
import Register from "./components/Register";
import Login from "./components/Login";
import BaseShop from "./components/layouts/BaseShop";
import Shop from "./components/shop/Shop";
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
import ProductProvider from "./context/ProductContext";
import Show from "./components/admin/content/product/Show";
import ProductDetails from "./components/ProductDetails";
function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Routes>
        <Route path="" Component={Base}>
          <Route path="" index Component={Home} />
          <Route path="/contact" Component={Contact} />
          <Route path="/vendeur" Component={Vendeur} />
          <Route path="/profil" Component={Profil} />
          <Route path="/redirect" Component={ChangeUser} />
          <Route path="/product/detail" Component={ProductDetails}/>
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/confirmCompte" Component={registerConfirmation} />
        <Route path="/logout" Component={Logout} />
        <Route path="" Component={BaseShop}>
          <Route path="/shop" Component={Shop} />
        </Route>

        {/* Route pour les administrateurs */}
        <Route
          path="/espace_vendeur"
          element={
            <ProtectedRoute role="Boutiks">
              <ProductProvider>
                <AppAdmin />
              </ProductProvider>
            </ProtectedRoute>
          }
        >
          <Route path="dash" Component={Dash}></Route>
          <Route path="products" Component={Content}></Route>
          <Route path="admin/addProduct" Component={Add}></Route>
          <Route path="products/:id" Component={Show}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

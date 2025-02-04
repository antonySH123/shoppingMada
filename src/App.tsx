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
import Page404 from "./error/Page404";
import TopProgressBar from "./components/progress/TopProgressBar";
import ScrollToTop from "./components/progress/ScrollToTop";
import List from "./components/admin/content/commande/List";
import BoutiksInfo from "./components/admin/content/boutikInfo/BoutiksInfo";
import ListAbonnement from "./components/admin/abonnements/ListAbonnement";
import Compte from "./components/admin/compte/Compte";
import CommandeDetails from "./components/admin/content/commande/CommandeDetails";
import AccountsDetails from "./components/admin/compte/AccountsDetails";
import EmailForgotPass from "./components/EmailForgotPass";
import ResetPassword from "./components/ResetPassword";
function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <TopProgressBar />
      <ScrollToTop/>
      <Routes>
        <Route path="" Component={Base}>
          <Route path="" index Component={Home} />
          <Route path="/contact" Component={Contact} />
          <Route path="/vendeur" Component={Vendeur} />
          <Route path="/profil" Component={Profil} />
          <Route path="/redirect" Component={ChangeUser} />
          <Route path="/product/:id/details" Component={ProductDetails} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPass" element={<EmailForgotPass/>}/>
        <Route path="/resetPassword" element={<ResetPassword/>}/>
        <Route path="/confirmCompte" Component={registerConfirmation} />
        <Route path="/logout" Component={Logout} />
        <Route path="" Component={BaseShop}>
          <Route path="/shop/:slug?" Component={Shop} />
        </Route>

        {/* Route pour les administrateurs */}
        <Route
          path="/espace_vendeur"
          element={
            // <ProtectedRoute role="Boutiks">
              <ProductProvider>
                <AppAdmin />
              </ProductProvider>
            // </ProtectedRoute>
          }
        >
          <Route path="dash" Component={Dash}></Route>
          <Route path="products" Component={Content}></Route>
          <Route path="admin/addProduct/:productId?" Component={Add}></Route>
          <Route path="products/:id" Component={Show}></Route>
          {/* Route pour les commandes */}
          <Route path="commandes" Component={List}></Route>
          <Route path="commandeDetails" Component={CommandeDetails}></Route>
          <Route path="boutiksInfo" Component={BoutiksInfo}></Route>
          <Route path="abonnements" Component={ListAbonnement}></Route>
          <Route path="shopaccounts" Component={Compte}></Route>
          <Route path="accountsSettings" Component={AccountsDetails}></Route>
          
        </Route>

        <Route path="*" Component={Page404} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

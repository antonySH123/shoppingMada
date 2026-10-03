import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./components/Home";
import Base from "./components/layouts/Base";
import Register from "./components/Register";
import Login from "./components/Login";
import BaseShop from "./components/layouts/BaseShop";
import Vendeur from "./components/Vendeur";
import registerConfirmation from "./components/registerConfirmation";
import AppAdmin from "./components/admin/AppAdmin";
import Profil from "./components/Profil";
import Content from "./components/admin/content/Content";
import Dash from "./components/admin/content/Dash";
import ChangeUser from "./components/ChangeUser";
import Logout from "./auth/Logout";
import ProtectedRoute from "./context/ProtectedRoute";
import ProductProvider from "./context/ProductContext";
import Page404 from "./error/Page404";
import TopProgressBar from "./components/progress/TopProgressBar";
import ScrollToTop from "./components/progress/ScrollToTop";
import List from "./components/admin/content/commande/List";
import BoutiksInfo from "./components/admin/content/boutikInfo/BoutiksInfo";
import ListAbonnement from "./components/admin/abonnements/ListAbonnement";
import Compte from "./components/admin/compte/Compte";
import CommandeDetails from "./components/admin/content/commande/CommandeDetails";
import AccountsDetails from "./components/admin/compte/AccountsDetails";
import CompteDesactiver from "./error/CompteDesactiver";
import EmailForgotPass from "./components/EmailForgotPass";
import ResetPassword from "./components/ResetPassword";
import DetailsAbonnements from "./components/admin/abonnements/DetailsAbonnements";
import UpgradePro from "./components/admin/abonnements/UpgradePro";
import { CartProvider } from "./context/CartContext";

const Shop = lazy(() => import("./components/shop/Shop"));
const Add = lazy(() => import("./components/admin/content/product/Add"));
const Show = lazy(() => import("./components/admin/content/product/Show"));
const ProductDetails = lazy(() => import("./components/ProductDetails"));
const CartPage = lazy(() => import("./components/CartPage"));
const OrderTracking = lazy(() => import("./components/OrderTracking"));
const MarketplaceOrders = lazy(
  () => import("./components/admin/orders/MarketplaceOrders"),
);
const ShopPaymentSettings = lazy(
  () => import("./components/admin/orders/ShopPaymentSettings"),
);
const MarketplaceDisputes = lazy(
  () => import("./components/admin/orders/MarketplaceDisputes"),
);
function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <CartProvider>
        <TopProgressBar />
        <ScrollToTop />
        <Suspense fallback={<div className="p-8 text-center">Chargement…</div>}>
          <Routes>
            <Route path="" Component={Base}>
              <Route path="" index Component={Home} />
              <Route path="/vendeur" Component={Vendeur} />
              <Route path="/profil" Component={Profil} />
              <Route path="/panier" Component={CartPage} />
              <Route
                path="/suivi-commande/:orderId"
                Component={OrderTracking}
              />
              <Route path="/redirect" Component={ChangeUser} />
              <Route path="/product/:id/details" Component={ProductDetails} />
              <Route path="/confirmCompte" Component={registerConfirmation} />
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotPass" element={<EmailForgotPass />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/logout" Component={Logout} />
            <Route path="" Component={BaseShop}>
              <Route path="/shop/:slug?" Component={Shop} />
            </Route>

            {/* Route pour les administrateurs */}
            <Route
              path="/espace_vendeur"
              element={
                <ProtectedRoute>
                  <ProductProvider>
                    <AppAdmin />
                  </ProductProvider>
                </ProtectedRoute>
              }
            >
              <Route path="dash" Component={Dash}></Route>
              <Route path="products" Component={Content}></Route>
              <Route
                path="admin/addProduct/:productId?"
                Component={Add}
              ></Route>
              <Route path="products/:id" Component={Show}></Route>
              {/* Route pour les commandes */}
              <Route path="commandes" Component={List}></Route>
              <Route
                path="marketplace-orders"
                Component={MarketplaceOrders}
              ></Route>
              <Route
                path="paiement-livraison"
                Component={ShopPaymentSettings}
              ></Route>
              <Route path="litiges" Component={MarketplaceDisputes}></Route>
              <Route path="commande/:id" Component={CommandeDetails}></Route>
              <Route path="boutiksInfo" Component={BoutiksInfo}></Route>
              <Route path="abonnements" Component={ListAbonnement}></Route>
              <Route path="upgrade-pro" Component={UpgradePro}></Route>
              <Route
                path="abonnementsDetails/:id"
                Component={DetailsAbonnements}
              ></Route>
              <Route path="shopaccounts" Component={Compte}></Route>
              <Route
                path="accountsSettings/:id"
                Component={AccountsDetails}
              ></Route>
            </Route>
            <Route path="/none" Component={CompteDesactiver} />
            <Route path="*" Component={Page404} />
          </Routes>
        </Suspense>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;

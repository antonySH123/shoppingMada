import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Base from "./components/layouts/Base";
import BaseShop from "./components/layouts/BaseShop";
import ProtectedRoute from "./context/ProtectedRoute";
import ProductProvider from "./context/ProductContext";
import TopProgressBar from "./components/progress/TopProgressBar";
import ScrollToTop from "./components/progress/ScrollToTop";
import { CartProvider } from "./context/CartContext";

const Home = lazy(() => import("./components/Home"));
const Register = lazy(() => import("./components/Register"));
const Login = lazy(() => import("./components/Login"));
const Vendeur = lazy(() => import("./components/Vendeur"));
const registerConfirmation = lazy(
  () => import("./components/registerConfirmation"),
);
const AppAdmin = lazy(() => import("./components/admin/AppAdmin"));
const Profil = lazy(() => import("./components/Profil"));
const Content = lazy(() => import("./components/admin/content/Content"));
const Dash = lazy(() => import("./components/admin/content/Dash"));
const ChangeUser = lazy(() => import("./components/ChangeUser"));
const Logout = lazy(() => import("./auth/Logout"));
const Page404 = lazy(() => import("./error/Page404"));
const List = lazy(() => import("./components/admin/content/commande/List"));
const BoutiksInfo = lazy(
  () => import("./components/admin/content/boutikInfo/BoutiksInfo"),
);
const ListAbonnement = lazy(
  () => import("./components/admin/abonnements/ListAbonnement"),
);
const Compte = lazy(() => import("./components/admin/compte/Compte"));
const CommandeDetails = lazy(
  () => import("./components/admin/content/commande/CommandeDetails"),
);
const AccountsDetails = lazy(
  () => import("./components/admin/compte/AccountsDetails"),
);
const CompteDesactiver = lazy(() => import("./error/CompteDesactiver"));
const EmailForgotPass = lazy(() => import("./components/EmailForgotPass"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const DetailsAbonnements = lazy(
  () => import("./components/admin/abonnements/DetailsAbonnements"),
);
const UpgradePro = lazy(
  () => import("./components/admin/abonnements/UpgradePro"),
);
const SubscriptionPaymentSettings = lazy(
  () => import("./components/admin/abonnements/SubscriptionPaymentSettings"),
);
const Moderation = lazy(() => import("./components/admin/Moderation"));
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
    <BrowserRouter>
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
              <Route
                path="abonnements-paiement"
                Component={SubscriptionPaymentSettings}
              ></Route>
              <Route path="moderation" Component={Moderation}></Route>
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

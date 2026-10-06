import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "fr" | "en";
type Messages = Record<string, string>;

const storageKey = "shopinmada.language.v1";
const catalogs: Record<Language, Messages> = {
  fr: {
    "language.label": "Langue",
    "language.french": "Français",
    "language.english": "Anglais",
    "nav.discover": "Découvrir",
    "nav.becomeSeller": "Devenir vendeur",
    "nav.about": "À propos",
    "nav.proOffer": "Offre Pro",
    "nav.contact": "Contact",
    "nav.localMarket": "Des boutiques locales, partout à Madagascar",
    "nav.searchDesktop": "Que recherchez-vous aujourd’hui ?",
    "nav.searchMobile": "Rechercher un produit...",
    "nav.search": "Rechercher",
    "nav.account": "Mon compte",
    "nav.login": "Connexion",
    "nav.register": "Créer un compte",
    "nav.registerShort": "Inscription",
    "nav.logout": "Déconnexion",
    "nav.sellerSpace": "Mon espace",
    "nav.sell": "Vendre",
    "nav.allCities": "Toutes les villes",
    "nav.categories": "Catégories",
    "nav.exploreProducts": "Explorer les produits",
    "nav.joinSellers": "Vous êtes vendeur ? Rejoignez-nous",
    "admin.professionalSpace": "Espace professionnel",
    "admin.menu": "Menu",
    "admin.dashboard": "Tableau de bord",
    "admin.products": "Produits",
    "admin.subscriptions": "Abonnements",
    "admin.orders": "Commandes",
    "admin.marketOrders": "Commandes marketplace",
    "admin.deliveryPayment": "Paiement et livraison",
    "admin.disputes": "Litiges marketplace",
    "admin.subscriptionPayments": "Paiements d’abonnement",
    "admin.upgrade": "Passer à ShopInMada Pro",
    "admin.shopInfo": "Informations de la boutique",
    "admin.accounts": "Gestion des comptes",
    "admin.accountSettings": "Paramètres du compte",
    "admin.addProduct": "Ajouter un produit",
    "admin.themeLight": "clair",
    "admin.themeDark": "sombre",
    "profile.preferences": "Préférences",
    "profile.languageSpace": "Langue de votre espace",
    "cart.title": "Panier et validation",
    "cart.selection": "Votre sélection",
    "cart.emptyButton": "Vider le panier",
    "cart.delivery": "Livraison",
    "cart.shop": "Boutique",
    "cart.choosePayment": "Choisir un mode de paiement",
    "cart.customerDetails": "Vos coordonnées",
    "cart.guestCheckout": "La commande peut être passée sans compte client.",
  },
  en: {
    "language.label": "Language",
    "language.french": "French",
    "language.english": "English",
    "nav.discover": "Discover",
    "nav.becomeSeller": "Become a seller",
    "nav.about": "About",
    "nav.proOffer": "Pro plan",
    "nav.contact": "Contact",
    "nav.localMarket": "Local shops across Madagascar",
    "nav.searchDesktop": "What are you looking for today?",
    "nav.searchMobile": "Search for a product...",
    "nav.search": "Search",
    "nav.account": "My account",
    "nav.login": "Sign in",
    "nav.register": "Create an account",
    "nav.registerShort": "Register",
    "nav.logout": "Sign out",
    "nav.sellerSpace": "My workspace",
    "nav.sell": "Sell",
    "nav.allCities": "All cities",
    "nav.categories": "Categories",
    "nav.exploreProducts": "Explore products",
    "nav.joinSellers": "Are you a seller? Join us",
    "admin.professionalSpace": "Business workspace",
    "admin.menu": "Menu",
    "admin.dashboard": "Dashboard",
    "admin.products": "Products",
    "admin.subscriptions": "Subscriptions",
    "admin.orders": "Orders",
    "admin.marketOrders": "Marketplace orders",
    "admin.deliveryPayment": "Payment and delivery",
    "admin.disputes": "Marketplace disputes",
    "admin.subscriptionPayments": "Subscription payments",
    "admin.upgrade": "Upgrade to ShopInMada Pro",
    "admin.shopInfo": "Shop information",
    "admin.accounts": "Account management",
    "admin.accountSettings": "Account settings",
    "admin.addProduct": "Add a product",
    "admin.themeLight": "light",
    "admin.themeDark": "dark",
    "profile.preferences": "Preferences",
    "profile.languageSpace": "Workspace language",
    "cart.title": "Your cart and checkout",
    "cart.selection": "Your selection",
    "cart.emptyButton": "Empty cart",
    "cart.delivery": "Delivery",
    "cart.shop": "Shop",
    "cart.choosePayment": "Choose a payment method",
    "cart.customerDetails": "Your details",
    "cart.guestCheckout": "You can place an order without an account.",
  },
};

const translationBundles: Record<Language, Record<string, string>> = {
  fr: {
    "home.kicker": "Le commerce malgache, à portée de clic",
    "home.title": "Les trouvailles locales",
    "home.titleAccent": "qui font la différence.",
    "home.intro": "Explorez des produits uniques et soutenez les boutiques de Madagascar. Votre prochaine belle découverte est ici.",
    "home.search": "Un produit, une boutique, une idée...",
    "home.localShops": "Boutiques locales",
    "home.productsForAll": "Des produits pour tous",
    "home.selection": "Sélection du moment",
    "home.popularProducts": "Nos produits populaires",
    "home.viewAll": "Voir toute la boutique",
    "home.noProducts": "Les produits arrivent bientôt.",
    "footer.tagline": "La marketplace locale de Madagascar",
    "footer.rights": "Tous droits réservés.",
    "cart.title": "Panier et validation",
    "cart.selection": "Votre sélection",
    "cart.emptyButton": "Vider le panier",
    "cart.delivery": "Livraison",
    "cart.shop": "Boutique",
    "cart.choosePayment": "Choisir un mode de paiement",
    "cart.customerDetails": "Vos coordonnées",
    "cart.guestCheckout": "La commande peut être passée sans compte client.",
    "cart.empty": "Votre panier est vide",
    "cart.explore": "Parcourez les boutiques locales et ajoutez vos articles.",
    "cart.checkout": "Confirmer les commandes",
    "cart.submitting": "Envoi en cours…",
    "cart.name": "Nom complet",
    "cart.phone": "Téléphone",
    "cart.city": "Ville",
    "cart.address": "Adresse de livraison",
    "product.unavailable": "Produit indisponible",
    "product.notFound": "Ce produit n’existe pas ou n’est plus publié.",
    "product.outOfStock": "Rupture de stock",
    "product.addToCart": "Ajouter au panier",
  },
  en: {
    "home.kicker": "Madagascar’s marketplace, one click away",
    "home.title": "Discover local finds",
    "home.titleAccent": "that make a difference.",
    "home.intro": "Explore unique products and support shops across Madagascar. Your next great find is here.",
    "home.search": "A product, a shop, an idea...",
    "home.localShops": "Local shops",
    "home.productsForAll": "Products for everyone",
    "home.selection": "Featured today",
    "home.popularProducts": "Popular products",
    "home.viewAll": "Browse all products",
    "home.noProducts": "Products are coming soon.",
    "footer.tagline": "Madagascar’s local marketplace",
    "footer.rights": "All rights reserved.",
    "cart.title": "Your cart and checkout",
    "cart.selection": "Your selection",
    "cart.emptyButton": "Empty cart",
    "cart.delivery": "Delivery",
    "cart.shop": "Shop",
    "cart.choosePayment": "Choose a payment method",
    "cart.customerDetails": "Your details",
    "cart.guestCheckout": "You can place an order without an account.",
    "cart.empty": "Your cart is empty",
    "cart.explore": "Browse local shops and add items to your cart.",
    "cart.checkout": "Place orders",
    "cart.submitting": "Submitting…",
    "cart.name": "Full name",
    "cart.phone": "Phone",
    "cart.city": "City",
    "cart.address": "Delivery address",
    "product.unavailable": "Product unavailable",
    "product.notFound": "This product does not exist or is no longer published.",
    "product.outOfStock": "Out of stock",
    "product.addToCart": "Add to cart",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
export { LanguageContext };

function getInitialLanguage(): Language {
  try {
    return localStorage.getItem(storageKey) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, language);
    } catch {
      // Language selection still works for the current session.
    }
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) =>
    translationBundles[language][key] ??
    translationBundles.fr[key] ??
    catalogs[language][key] ??
    catalogs.fr[key] ??
    key;
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

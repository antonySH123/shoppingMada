# ShopInMada Frontend

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

````js
export default tseslint.config({
  languageOptions: {
    // other options...
    Interface web de la marketplace ShopInMada : découverte de produits, parcours client, profil et outils de gestion des boutiques. L'application est développée avec **React 18**, **TypeScript**, **Vite** et **Tailwind CSS**.

    [![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)](https://react.dev/)
    [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
    [![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vite.dev/)

    ## Fonctionnalités

    - Accueil et navigation du catalogue, recherche de produits et pages boutique.
    - Inscription, connexion, profil et gestion de session.
    - Espace vendeur : produits, commandes, boutique et abonnements.
    - Formulaires de création et de gestion des informations personnelles et de boutique.

    ## Prérequis

    - Node.js et npm.
    - Le backend ShopInMada et la Category API pour les fonctionnalités connectées.

    ## Installation

    Depuis le dossier `frontend` :

    ```powershell
    Copy-Item .env.example .env
    npm install
    npm run dev
    ```

    Vite affiche l'URL locale du serveur dans le terminal, généralement `http://localhost:5173`.

    ## Configuration

    Définissez les URL des API dans `.env` :

    | Variable | Description | Valeur locale type |
    | --- | --- | --- |
    | `REACT_API_URL` | URL de base du backend métier | `http://localhost:3000/api/v1/` |
    | `REACT_API_CATEGORY_URL` | URL de base de l'API des catégories | `http://localhost:3001/api/v1/` |

    Ces variables sont intégrées au bundle client : n'y placez jamais de secret, de mot de passe ou de clé privée.

    ## Scripts

    | Commande | Description |
    | --- | --- |
    | `npm run dev` | Serveur de développement avec HMR |
    | `npm run lint` | Vérification ESLint |
    | `npm run build` | Vérification TypeScript et build de production |
    | `npm run preview` | Prévisualisation locale du build |

    ## Droits d'utilisation

    Ce frontend est un projet client privé. **La réutilisation commerciale, la copie, la redistribution ou la republication de son code sont interdites sans autorisation écrite préalable du détenteur des droits.** Aucune licence de réutilisation n'est accordée par ce README.

    ## Contact

    **Avotra Frederic** · FullCoding — Lead Developer

    Software Engineering · Full-stack web & mobile · Backend & Software Architecture · Automation & AI

    [GitHub](https://github.com/avotra-frederic) · [LinkedIn](https://linkedin.com/in/avotra-frederic) · [fred.avotra@gmail.com](mailto:fred.avotra@gmail.com)
````

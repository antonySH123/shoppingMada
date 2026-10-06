import Iuser from "../Interface/UserInterface";

// Définition des types

  
  type Errors = {
    username?: string;
    email?: string;
    password?: string;
    phonenumber?: string;
  };
  
  export default function validator(values: Iuser): Errors {
    // Expressions régulières
    const regPhone = /^(?:(\+261)|0)(32|33|34|38|37)\d{7}$/; // Numéros valides à Madagascar
    const regNom = /^[a-zA-Zàâäéèêëîïôöùûüç\s'-]+$/; // Autorise les lettres avec accents, espaces et apostrophes
    const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  
    // Objet pour stocker les erreurs
    const errors: Errors = {};
  
    // Validation des champs
    if (!values.username) {
      errors.username = "Nom obligatoire.";
    } else if (values.username.length < 3 || values.username.length > 30 || !regNom.test(values.username)) {
      errors.username = "Nom invalide. Utilisez uniquement des lettres et espaces.";
    }
  
    if (!values.email) {
      errors.email = "Email requis.";
    } else if (!regEmail.test(values.email)) {
      errors.email = "Email invalide.";
    }
  
    if (!values.password) {
      errors.password = "Mot de passe requis.";
    } else if (
      values.password.length < 8 ||
      !/[a-z]/.test(values.password) ||
      !/[A-Z]/.test(values.password) ||
      !/\d/.test(values.password) ||
      !/[^a-zA-Z0-9]/.test(values.password)
    ) {
      errors.password = "Le mot de passe doit comporter au moins 8 caractères et inclure une majuscule, une minuscule, un chiffre et un caractère spécial.";
    }
  
    if (!values.phonenumber) {
      errors.phonenumber = "Numéro de téléphone requis.";
    } else if (!regPhone.test(values.phonenumber)) {
      errors.phonenumber = "Numéro de téléphone invalide.";
    }
  
    return errors;
  }
  export type {Errors}
  
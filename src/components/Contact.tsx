import { FormEvent, useState } from "react";
import { FaAddressBook, FaPhone } from "react-icons/fa";
import { toast } from "react-toastify";
import useCSRF from "../helper/useCSRF";

function Contact() {
  const csrf = useCSRF();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!csrf || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_URL}contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xsrf-token": csrf },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Impossible d’envoyer le message.");
      toast.success(result.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer le message.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section py-16 sm:py-20" id="contact">
      <div className="market-container">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Restons en contact
          </p>
          <h2 className="market-section-title">Parlons de votre projet.</h2>
          <p className="mt-3 text-sm leading-7 text-gray-500">
            Une question sur ShopInMada ? Notre équipe est disponible pour vous
            aider.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="contact-details grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="contact-info-card rounded-2xl p-6 sm:p-7">
              <span className="contact-icon">
                <FaAddressBook />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-emerald-200">
                Notre adresse
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">Madagascar</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Au service du commerce local, partout dans le pays.
              </p>
            </article>
            <article className="market-card p-6 sm:p-7">
              <span className="contact-icon contact-icon-light">
                <FaPhone />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-gray-400">
                Appelez-nous
              </p>
              <a
                href="tel:+261345385365"
                className="mt-2 inline-block text-xl font-bold text-gray-900 transition hover:text-emerald-800"
              >
                +261 34 53 853 65
              </a>
              <p className="mt-2 text-sm text-gray-500">
                Nous serons ravis d’échanger avec vous.
              </p>
            </article>
          </div>
          <div className="market-card p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">
                Envoyez-nous un message
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Remplissez les champs ci-dessous pour nous écrire.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="contact-form grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
                Votre nom
                <input
                  type="text"
                  className="market-input w-full"
                  placeholder="Ex. Rakoto Jean"
                  aria-label="Votre nom"
                  autoComplete="name"
                  minLength={2}
                  maxLength={120}
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
                Adresse email
                <input
                  type="email"
                  className="market-input w-full"
                  placeholder="nom@exemple.mg"
                  aria-label="Adresse email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 sm:col-span-2">
                Sujet
                <input
                  type="text"
                  className="market-input w-full"
                  placeholder="Comment pouvons-nous vous aider ?"
                  aria-label="Sujet"
                  minLength={3}
                  maxLength={160}
                  required
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 sm:col-span-2">
                Votre message
                <textarea
                  className="market-input w-full"
                  placeholder="Écrivez votre message ici…"
                  rows={5}
                  aria-label="Votre message"
                  minLength={10}
                  maxLength={4000}
                  required
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting || !csrf}
                className="market-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? "Envoi en cours…" : "Envoyer le message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;

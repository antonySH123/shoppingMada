import { FaAddressBook, FaPhone } from 'react-icons/fa'
function Contact() {
  return (
    <section className="contact-section py-16 sm:py-20" id="contact">
      <div className="market-container">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Restons en contact</p>
          <h2 className="market-section-title">Parlons de votre projet.</h2>
          <p className="mt-3 text-sm leading-7 text-gray-500">Une question sur ShopInMada ? Notre équipe est disponible pour vous aider.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="contact-details grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="contact-info-card rounded-2xl p-6 sm:p-7">
              <span className="contact-icon"><FaAddressBook /></span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-emerald-200">Notre adresse</p>
              <h3 className="mt-2 text-xl font-bold text-white">Madagascar</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">Au service du commerce local, partout dans le pays.</p>
            </article>
            <article className="market-card p-6 sm:p-7">
              <span className="contact-icon contact-icon-light"><FaPhone /></span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-gray-400">Appelez-nous</p>
              <a href="tel:+261345385365" className="mt-2 inline-block text-xl font-bold text-gray-900 transition hover:text-emerald-800">+261 34 53 853 65</a>
              <p className="mt-2 text-sm text-gray-500">Nous serons ravis d’échanger avec vous.</p>
            </article>
          </div>
          <div className="market-card p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">Envoyez-nous un message</h3>
              <p className="mt-1 text-sm text-gray-500">Remplissez les champs ci-dessous pour nous écrire.</p>
            </div>
            <form action="" method="post" className="contact-form grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">Votre nom<input type="text" className="market-input w-full" placeholder="Ex. Rakoto Jean" aria-label="Votre nom" /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">Adresse email<input type="email" className="market-input w-full" placeholder="nom@exemple.mg" aria-label="Adresse email" /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 sm:col-span-2">Sujet<input type="text" className="market-input w-full" placeholder="Comment pouvons-nous vous aider ?" aria-label="Sujet" /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 sm:col-span-2">Votre message<textarea className="market-input w-full" placeholder="Écrivez votre message ici…" rows={5} aria-label="Votre message" /></label>
              <button type="submit" className="market-button-primary w-full sm:w-auto">Envoyer le message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;

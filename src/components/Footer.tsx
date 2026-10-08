import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#10271b] text-white">
      <div className="market-container flex flex-col items-center justify-between gap-5 py-8 sm:flex-row">
        <Link to="/" className="flex items-center gap-3 font-semibold">
          <img src="/logo.png" alt="ShopInMada" className="h-10 w-auto rounded bg-white p-1" />
          <span className="text-sm text-white/70">{t("footer.tagline")}</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/75" aria-label={t("footer.tagline")}>
          <Link to="/#about" className="transition hover:text-white">{t("footer.about")}</Link>
          <Link to="/#contact" className="transition hover:text-white">{t("footer.contact")}</Link>
          <Link to="/#abonnements" className="transition hover:text-white">{t("footer.pro")}</Link>
        </nav>
        <p className="text-xs text-white/55">© {new Date().getFullYear()} ShopInMada. {t("footer.rights")}</p>
      </div>
    </footer>
  )
}

export default Footer

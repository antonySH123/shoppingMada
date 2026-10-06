import { FaFacebook, FaInstagram } from "react-icons/fa";
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
        <div className="flex items-center gap-3">
          <a href="https://facebook.com" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10"><FaFacebook /></a>
          <a href="https://instagram.com" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10"><FaInstagram /></a>
        </div>
        <p className="text-xs text-white/55">© {new Date().getFullYear()} ShopInMada. {t("footer.rights")}</p>
      </div>
    </footer>
  )
}

export default Footer

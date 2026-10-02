import { useEffect, useState } from "react";
import { LiaAngleDownSolid, LiaBarsSolid, LiaTimesSolid } from "react-icons/lia";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/useSidebar";

interface ICategory {
  name: string;
  slug: string;
  children?: ICategory[];
}

function CategoryItem({ category, depth = 0, onNavigate }: { category: ICategory; depth?: number; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const children = category.children ?? [];

  return (
    <li>
      <div className={`group flex items-center rounded-xl transition hover:bg-emerald-50 ${depth ? "ml-3" : ""}`}>
        <Link to={`/shop/${category.slug}`} onClick={onNavigate} className="min-w-0 flex-1 truncate px-3 py-2.5 text-[13px] font-medium text-gray-600 transition group-hover:text-emerald-900">
          {category.name}
        </Link>
        {children.length > 0 && (
          <button type="button" aria-label={`${expanded ? "Masquer" : "Afficher"} les sous-catégories de ${category.name}`} aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-emerald-800">
            <LiaAngleDownSolid className={`transition-transform ${expanded ? "rotate-180" : ""}`} size={17} />
          </button>
        )}
      </div>
      {expanded && children.length > 0 && (
        <ul className="ml-3 mt-1 space-y-0.5 border-l border-emerald-100 pl-2">
          {children.map((child) => <CategoryItem key={child.slug} category={child} depth={depth + 1} onNavigate={onNavigate} />)}
        </ul>
      )}
    </li>
  );
}

const Sidebar = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const { isOpen: mobileOpen, toggler: toggleMobileOpen } = useSidebar();
  const isOpen = isMobile ? mobileOpen : desktopOpen;
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDesktopOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.REACT_API_CATEGORY_URL}all/category`, { signal: controller.signal });
        if (!response.ok) throw new Error("Categories unavailable");
        const data = await response.json();
        setCategories(Array.isArray(data.category) ? data.category : []);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, []);

  const closeAfterNavigation = () => {
    if (isMobile && mobileOpen) toggleMobileOpen();
  };

  const toggleOpen = () => {
    if (isMobile) toggleMobileOpen();
    else setDesktopOpen((value) => !value);
  };

  return (
    <>
      {isMobile && isOpen && <button type="button" aria-label="Fermer les catégories" onClick={toggleMobileOpen} className="fixed inset-0 top-[6.65rem] z-40 bg-gray-950/35 backdrop-blur-[1px]" />}
      {(!isMobile || isOpen) && <aside id="shop-category-sidebar" className={`fixed bottom-0 left-0 top-[6.65rem] z-50 flex w-[min(19rem,88vw)] flex-col border-r border-gray-200 bg-white shadow-[12px_0_35px_rgba(20,40,28,0.08)] transition-[transform,width] duration-300 md:sticky md:top-[6.65rem] md:z-20 md:h-[calc(100vh-6.65rem)] md:shrink-0 md:shadow-none ${isMobile ? "translate-x-0" : (isOpen ? "md:w-[18rem]" : "md:w-[4.5rem]")}`}>
        <div className={`flex min-h-[4.5rem] items-center border-b border-gray-100 ${isOpen ? "justify-between px-5" : "justify-center px-2"}`}>
          {isOpen && <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Explorer</p><h2 className="mt-0.5 text-sm font-bold text-gray-900">Catégories</h2></div>}
          <button type="button" onClick={toggleOpen} aria-label={isOpen ? "Réduire les catégories" : "Afficher les catégories"} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">
            {isMobile ? <LiaTimesSolid size={19} /> : <LiaBarsSolid size={19} />}
          </button>
        </div>
        {isOpen && (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <Link to="/shop" onClick={closeAfterNavigation} className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100">
              Tous les produits <span aria-hidden="true">→</span>
            </Link>
            {error ? (
              <p role="status" className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Impossible de charger les catégories pour le moment.</p>
            ) : categories.length ? (
              <ul className="space-y-1">{categories.map((category) => <CategoryItem key={category.slug} category={category} onNavigate={closeAfterNavigation} />)}</ul>
            ) : (
              <p className="px-3 py-2 text-xs text-gray-400">Chargement des catégories…</p>
            )}
          </div>
        )}
      </aside>}
    </>
  );
};

export default Sidebar;

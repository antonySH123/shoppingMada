import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaAngleRight, FaArrowLeft, FaSearch } from "react-icons/fa";
import { useCategory } from "../../context/useCategory";
import { useLanguage } from "../../context/useLanguage";

interface Category {
  _id: string;
  name: string;
  slug: string;
  translations?: { fr?: string; en?: string };
  children?: Category[];
}

interface FlatCategory { category: Category; path: Category[] }

const frenchCategoryNames: Record<string, string> = {
  "sports & outdoors": "Sports et plein air", "sports & fitness": "Sports et fitness",
  "home & kitchen": "Maison et cuisine", "beauty & personal care": "Beauté et soins personnels",
  "clothing, shoes & jewelry": "Vêtements, chaussures et bijoux", "electronics": "Électronique",
  "tools & home improvement": "Bricolage et amélioration de la maison", "toys & games": "Jouets et jeux",
  "automotive": "Automobile", "office products": "Fournitures de bureau", "grocery & gourmet food": "Épicerie et produits gourmets",
  "health & household": "Santé et maison", "baby": "Bébé", "books": "Livres", "pet supplies": "Articles pour animaux",
  "outdoor recreation": "Activités de plein air", "cycling": "Cyclisme", "team sports": "Sports collectifs",
  "winter sports": "Sports d’hiver", "water sports": "Sports nautiques", "skateboarding": "Skateboard",
  "inline & roller skating": "Roller et patinage", "scooters & equipment": "Trottinettes et équipements",
  "kids' bikes & accessories": "Vélos et accessoires pour enfants", "protective gear": "Équipements de protection",
  "helmets": "Casques", "accessories": "Accessoires", "components & parts": "Composants et pièces",
  "replacement wheels": "Roues de remplacement", "bikes": "Vélos", "balls": "Ballons et balles",
  "soccer": "Football", "basketball": "Basketball", "volleyball": "Volleyball", "tennis": "Tennis",
  "diving & snorkeling": "Plongée et snorkeling", "kayaking": "Kayak", "canoeing": "Canoë",
  "standard skateboards": "Skateboards classiques", "longboards": "Longboards", "roller skates": "Patins à roulettes",
  "inline skates": "Rollers en ligne", "children's inline skates": "Rollers en ligne pour enfants",
  "knee pads": "Genouillères", "elbow pads": "Coudières", "wrist guards": "Protège-poignets",
  "lights & reflectors": "Éclairage et réflecteurs", "bike bells": "Sonnettes de vélo",
};

const frenchLabel = (category: Category, language: string) => {
  if (language !== "fr") return category.translations?.en?.trim() || category.name.trim();
  const provided = category.translations?.fr?.trim();
  if (provided) return provided;
  return frenchCategoryNames[category.name.trim().toLocaleLowerCase()] || category.name.trim();
};

function flattenCategories(items: Category[], ancestors: Category[] = []): FlatCategory[] {
  return items.flatMap((category) => {
    const path = [...ancestors, category];
    return [{ category, path }, ...flattenCategories(category.children ?? [], path)];
  });
}

function Categorie() {
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const { language } = useLanguage();
  const [tree, setTree] = useState<Category[]>([]);
  const [branch, setBranch] = useState<Category[]>([]);
  const [path, setPath] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(() => flattenCategories(tree), [tree]);
  const selected = useMemo(() => labels.find(({ category }) => category.slug === selectedCategoryId), [labels, selectedCategoryId]);
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    return labels.filter(({ category, path: categoryPath }) => {
      const localizedPath = categoryPath.map((part) => frenchLabel(part, language)).join(" ");
      return `${localizedPath} ${category.name} ${category.slug}`.toLocaleLowerCase().includes(normalized);
    }).slice(0, 30);
  }, [labels, language, query]);

  const loadCategories = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`${import.meta.env.REACT_API_CATEGORY_URL}all/category`, { signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Category API unavailable");
      const result = await response.json();
      const categories = Array.isArray(result.category) ? result.category as Category[] : [];
      setTree(categories);
      setBranch(categories);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const choose = (entry: FlatCategory) => {
    // Product.category historically stores the category slug; keep that contract for existing products.
    setSelectedCategoryId(entry.category.slug);
    setPath(entry.path);
    setQuery("");
    setOpen(false);
  };

  const enter = (category: Category) => {
    setPath((current) => [...current, category]);
    setBranch(category.children ?? []);
    setQuery("");
  };

  const goToLevel = (index: number) => {
    const nextPath = path.slice(0, index + 1);
    setPath(nextPath);
    setBranch(index < 0 ? tree : nextPath[index].children ?? []);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-left text-sm text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-accent-solid)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent-solid)]/30">
        <span className={selected ? "min-w-0" : "text-[var(--admin-muted)]"}>
          {selected ? <><span className="block truncate font-semibold">{frenchLabel(selected.category, language)}</span><span className="mt-0.5 block truncate text-xs text-[var(--admin-muted)]">{selected.path.map((part) => frenchLabel(part, language)).join(" › ")}</span></> : language === "fr" ? "Rechercher ou parcourir les catégories" : "Search or browse categories"}
        </span>
        {selected && <span className="shrink-0 text-xs font-semibold text-[var(--admin-accent-solid)]">{language === "fr" ? "Modifier" : "Change"}</span>}
      </button>

      {open && <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl">
        <div className="border-b border-[var(--admin-border)] p-3">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] px-3">
            <FaSearch className="shrink-0 text-[var(--admin-muted)]" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "fr" ? "Ex. chaussures, cuisine, téléphone…" : "E.g. shoes, kitchen, phone…"} className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-muted)]" aria-label={language === "fr" ? "Rechercher une catégorie" : "Search categories"} />
          </label>
          {path.length > 0 && !query.trim() && <div className="mt-3 flex flex-wrap items-center gap-1 text-xs text-[var(--admin-muted)]"><button type="button" onClick={() => goToLevel(-1)} className="hover:text-[var(--admin-text)]">{language === "fr" ? "Toutes" : "All"}</button>{path.map((part, index) => <span key={part._id} className="inline-flex items-center gap-1"><FaAngleRight /><button type="button" onClick={() => goToLevel(index)} className="hover:text-[var(--admin-text)]">{frenchLabel(part, language)}</button></span>)}</div>}
        </div>

        {loading ? <p className="p-5 text-sm text-[var(--admin-muted)]">{language === "fr" ? "Chargement des catégories…" : "Loading categories…"}</p> : loadError ? <div className="p-5 text-sm"><p className="text-[var(--admin-warning)]">{language === "fr" ? "Impossible de charger les catégories." : "Categories could not be loaded."}</p><button type="button" onClick={() => void loadCategories()} className="mt-2 font-semibold text-[var(--admin-accent-solid)]">{language === "fr" ? "Réessayer" : "Try again"}</button></div> : query.trim() ? <div role="listbox" className="max-h-72 overflow-y-auto p-2">{searchResults.map((entry) => <button type="button" role="option" aria-selected={entry.category.slug === selectedCategoryId} key={entry.category._id} onClick={() => choose(entry)} className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--admin-surface-raised)]"><span className="min-w-0"><strong className="block text-sm text-[var(--admin-text)]">{frenchLabel(entry.category, language)}</strong><span className="mt-1 block text-xs text-[var(--admin-muted)]">{entry.path.map((part) => frenchLabel(part, language)).join(" › ")}</span></span><span className="shrink-0 rounded-lg bg-[var(--admin-accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--admin-accent-solid)]">{language === "fr" ? "Choisir" : "Select"}</span></button>)}{searchResults.length === 0 && <p className="p-4 text-sm text-[var(--admin-muted)]">{language === "fr" ? "Aucune catégorie correspondante." : "No matching category."}</p>}</div> : <div className="max-h-72 overflow-y-auto p-2">{path.length > 0 && <button type="button" onClick={() => goToLevel(path.length - 2)} className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[var(--admin-accent-solid)] hover:bg-[var(--admin-surface-raised)]"><FaArrowLeft />{language === "fr" ? "Retour" : "Back"}</button>}{branch.map((category) => <div key={category._id} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-[var(--admin-surface-raised)]"><button type="button" onClick={() => choose({ category, path: [...path, category] })} className="min-w-0 flex-1 py-2 text-left text-sm font-medium text-[var(--admin-text)]">{frenchLabel(category, language)}</button><button type="button" aria-label={`${language === "fr" ? "Parcourir" : "Browse"} ${frenchLabel(category, language)}`} onClick={() => enter(category)} disabled={!category.children?.length} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] disabled:opacity-30"><FaAngleRight /></button></div>)}{branch.length === 0 && <p className="p-4 text-sm text-[var(--admin-muted)]">{language === "fr" ? "Aucune sous-catégorie. Choisissez une autre branche." : "No subcategories. Choose another branch."}</p>}</div>}
        <div className="border-t border-[var(--admin-border)] px-4 py-2 text-[11px] text-[var(--admin-muted)]">{language === "fr" ? "Vous pouvez rechercher en français ou avec le nom d’origine." : "Search in English or using the original category name."}</div>
      </div>}
    </div>
  );
}

export default Categorie;

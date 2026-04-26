import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { EMPTY_TAXONOMY, loadTaxonomy, refreshTaxonomy, type Taxonomy } from "./taxonomy";

interface TaxonomyContextValue {
  taxonomy: Taxonomy;
  loading: boolean;
  refresh: () => Promise<void>;
}

const TaxonomyContext = createContext<TaxonomyContextValue>({
  taxonomy: EMPTY_TAXONOMY,
  loading: true,
  refresh: async () => {},
});

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const [taxonomy, setTaxonomy] = useState<Taxonomy>(EMPTY_TAXONOMY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadTaxonomy().then((snap) => {
      if (!cancelled) {
        setTaxonomy(snap);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TaxonomyContext.Provider
      value={{
        taxonomy,
        loading,
        refresh: async () => {
          const snap = await refreshTaxonomy();
          setTaxonomy(snap);
        },
      }}
    >
      {children}
    </TaxonomyContext.Provider>
  );
}

export function useTaxonomy() {
  return useContext(TaxonomyContext);
}

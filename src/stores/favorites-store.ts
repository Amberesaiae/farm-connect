import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FAVORITES } from "@/lib/data";

type FavState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: FAVORITES,
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((x) => x !== id)
            : [...state.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "farmlink-favorites" },
  ),
);

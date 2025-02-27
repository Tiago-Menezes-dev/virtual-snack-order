
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Produto, ProdutoCarrinho } from "@/types/menu";

interface CartStore {
  items: ProdutoCarrinho[];
  addToCart: (produto: Produto) => void;
  removeFromCart: (produto: Produto) => void;
  getQuantity: (produto: Produto) => number;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (produto) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.nome === produto.nome);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.nome === produto.nome
                  ? { ...item, quantidade: item.quantidade + 1 }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { ...produto, quantidade: 1 }],
          };
        });
      },
      
      removeFromCart: (produto) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.nome === produto.nome);
          
          if (!existingItem) return state;
          
          if (existingItem.quantidade === 1) {
            return {
              items: state.items.filter((item) => item.nome !== produto.nome),
            };
          }
          
          return {
            items: state.items.map((item) =>
              item.nome === produto.nome
                ? { ...item, quantidade: item.quantidade - 1 }
                : item
            ),
          };
        });
      },
      
      getQuantity: (produto) => {
        const item = get().items.find((item) => item.nome === produto.nome);
        return item?.quantidade || 0;
      },
      
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);

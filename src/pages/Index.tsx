
import { useState } from "react";
import menuData from "@/data/menu.json";
import { MenuTabs } from "@/components/MenuTabs";
import { OrderSummary } from "@/components/OrderSummary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";

const Index = () => {
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const { items } = useCart();
  
  const totalItems = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-center">Menu Digital</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          <MenuTabs menuData={menuData} />
        </div>
      </main>

      <footer className="border-t p-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-5xl mx-auto">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowOrderSummary(true)}
            disabled={totalItems === 0}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Ver Pedido
            {totalItems > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white text-black rounded-full">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </footer>

      <OrderSummary
        open={showOrderSummary}
        onOpenChange={setShowOrderSummary}
        items={items}
      />
    </div>
  );
};

export default Index;

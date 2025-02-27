
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MenuData } from "@/types/menu";
import ProductList from "./ProductList";

interface MenuTabsProps {
  menuData: MenuData;
}

export function MenuTabs({ menuData }: MenuTabsProps) {
  return (
    <Tabs defaultValue={menuData.tiposProdutos[0]} className="w-full">
      <TabsList className="w-full flex overflow-x-auto justify-start mb-6">
        {menuData.tiposProdutos.map((tipo) => (
          <TabsTrigger
            key={tipo}
            value={tipo}
            className="px-4 py-2 min-w-max"
          >
            {tipo}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {menuData.tiposProdutos.map((tipo) => (
        <TabsContent key={tipo} value={tipo} className="mt-0">
          <ProductList
            produtos={menuData.produtos.filter((p) => p.tipo === tipo)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

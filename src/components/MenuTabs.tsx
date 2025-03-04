import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MenuData } from "@/types/menu";
import ProductList from "./ProductList";

interface MenuTabsProps {
  menuData: MenuData;
}

export function MenuTabs({ menuData }: MenuTabsProps) {
  return (
    <Tabs defaultValue={menuData.tiposProdutos[0]} className="w-full">
      <TabsList className="w-full flex justify-start gap-4 mb-10 bg-transparent mt-8">
        {menuData.tiposProdutos.map((tipo) => (
          <TabsTrigger
            key={tipo}
            value={tipo}
            className="flex flex-col items-center gap-2 p-0 group data-[state=active]:shadow-none"
          >
            <div className="w-16 h-16 rounded-full border-primary bg-zinc-100 flex items-center justify-center group-data-[state=active]:bg-neutral-900">
              <img
                src={`/${tipo.toLowerCase()}.svg`}
                alt={tipo}
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
            <span className="text-sm">
              {tipo === 'hamburguer' ? 'Hamburguer' :
               tipo === 'bebida' ? 'Bebidas' :
               tipo === 'porcao' ? 'Porções' :
               tipo === 'sobremesa' ? 'Sobremesas' : tipo}
            </span>
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

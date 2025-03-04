import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Produto } from "@/types/menu";
import { useCart } from "@/hooks/useCart";

interface ProductListProps {
  produtos: Produto[];
}

export default function ProductList({ produtos }: ProductListProps) {
  const { addToCart, removeFromCart, getQuantity } = useCart();

  // Agrupa produtos por tipo e subtipo
  const groupedProducts = produtos.reduce((acc, produto) => {
    const tipo = produto.tipo || 'Outros';
    const subtipo = produto.subtipo || 'Geral';
    
    if (!acc[tipo]) {
      acc[tipo] = {};
    }
    if (!acc[tipo][subtipo]) {
      acc[tipo][subtipo] = [];
    }
    
    acc[tipo][subtipo].push(produto);
    return acc;
  }, {} as Record<string, Record<string, Produto[]>>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedProducts).map(([tipo, subtipos]) => (
        <div key={tipo} className="space-y-4">
          {Object.entries(subtipos).map(([subtipo, produtos]) => (
            <div key={subtipo} className="">
              <h3 className="text-xl font-semibold">{subtipo}</h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
                {produtos.map((produto) => (
                  <Card key={produto.nome} className="overflow-hidden shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.05),0px_12px_12px_-6px_rgba(0,0,0,0.04),0px_24px_24px_-12px_rgba(0,0,0,0.03)] border-none">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{produto.nome}</h3>
                            <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {`R$ ${Number(produto.valor).toFixed(2).replace('.', ',')}`}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeFromCart(produto)}
                              disabled={getQuantity(produto) === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{getQuantity(produto)}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => addToCart(produto)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

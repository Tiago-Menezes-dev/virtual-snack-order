
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {produtos.map((produto) => (
        <Card key={produto.nome} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{produto.nome}</h3>
                  <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                </div>
                <span className="font-semibold">
                  {produto.valor.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-end space-x-2">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

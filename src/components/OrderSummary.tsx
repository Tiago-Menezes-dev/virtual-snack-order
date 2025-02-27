
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProdutoCarrinho } from "@/types/menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OrderSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProdutoCarrinho[];
}

export function OrderSummary({ open, onOpenChange, items }: OrderSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const total = items.reduce((acc, item) => {
    return acc + item.valor * item.quantidade;
  }, 0);

  const handleWhatsAppOrder = () => {
    setIsLoading(true);
    try {
      const message = `Pedido de lanche\n\n${items
        .map((item) => `${item.quantidade}x - ${item.nome}`)
        .join("\n")}`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/5573999503835?text=${encodedMessage}`, "_blank");
      
      toast({
        title: "Pedido enviado com sucesso!",
        description: "Seu pedido foi enviado para o WhatsApp.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resumo do Pedido</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4">
            {items.map((item) => (
              <div key={item.nome} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.quantidade}x {item.nome}</p>
                  <p className="text-sm text-muted-foreground">{item.descricao}</p>
                </div>
                <p className="font-medium">
                  {(item.valor * item.quantidade).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">
            {total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
        
        <Button 
          onClick={handleWhatsAppOrder}
          disabled={items.length === 0 || isLoading}
          className="w-full"
        >
          Enviar Pedido
        </Button>
      </DialogContent>
    </Dialog>
  );
}

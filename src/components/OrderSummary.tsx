import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Remove the commented-out suggestion and implement it
const DialogAcrescimos = Dialog;
const DialogContentAcrescimos = DialogContent;
const DialogHeaderAcrescimos = DialogHeader;
const DialogTitleAcrescimos = DialogTitle;
const DialogTriggerAcrescimos = DialogTrigger;

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "@/firebase-config";

interface OrderSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProdutoCarrinho[];
}

interface Acrescimo {
  nome: string;
  valor: number;
}

interface ProdutoCarrinho {
  nome: string;
  valor: number;
  quantidade: number;
  descricao: string;
  opcoes?: string[];
  opcaoSelecionada?: string;
  incrementavel?: boolean;
}

interface AcrescimoQuantidade {
  nome: string;
  quantidade: number;
}

interface LocationData {
  regiao: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  observacao: string;
}

export function OrderSummary({ open, onOpenChange, items }: OrderSummaryProps) {
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [acrescimos, setAcrescimos] = useState<Record<string, AcrescimoQuantidade[]>>({});
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState<Record<string, string>>({});
  const [acrescimosDisponiveis, setAcrescimosDisponiveis] = useState<Acrescimo[]>([]);
  const { toast } = useToast();
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    regiao: 'Serra Grande',
    bairro: '',
    rua: '',
    numero: '',
    complemento: '',
    observacao: ''
  });

  const DELIVERY_FEE = "(A negociar)";

  const splitItems = (item: ProdutoCarrinho) => {
    // If incrementavel is true, always split into individual items
    if (item.incrementavel) {
      return Array(item.quantidade).fill({
        ...item,
        quantidade: 1
      });
    }
    
    // For non-incrementavel items, only split if they have options
    if (item.quantidade <= 1 || !item.opcoes?.length) {
      return [item];
    }
    return Array(item.quantidade).fill({
      ...item,
      quantidade: 1
    });
  };

  useEffect(() => {
    const fetchAcrescimos = async () => {
      const db = getDatabase();
      const user = auth.currentUser;
      
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      try {
        const dbRef = ref(db, `users/${user.uid}/acrescimos`);
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const acrescimosArray = Object.entries(data)
            .map(([id, value]) => ({
              id,
              ...(value as Acrescimo)
            }))
          
          setAcrescimosDisponiveis(acrescimosArray);
        }
      } catch (error) {
        console.error("Erro ao buscar acréscimos:", error);
        toast({
          title: "Erro ao carregar acréscimos",
          description: "Não foi possível carregar a lista de acréscimos.",
          variant: "destructive",
        });
      }
    };

    fetchAcrescimos();
  }, [toast]);

  const calculateItemTotal = (item: ProdutoCarrinho, splitIndex?: number) => {
    const itemKey = splitIndex !== undefined ? `${item.nome}-${splitIndex}` : item.nome;
    const itemAcrescimos = acrescimos[itemKey] || [];
    const acrescimosTotal = itemAcrescimos.reduce((acc, acrescimo) => {
      const acrescimoInfo = acrescimosDisponiveis.find(a => a.nome === acrescimo.nome);
      if (!acrescimoInfo) return acc;
      return acc + (acrescimoInfo.valor * acrescimo.quantidade);
    }, 0);
    
    // Para itens divididos (split), usamos quantidade 1
    // Para itens não divididos, usamos a quantidade original do item
    const quantidade = splitIndex !== undefined ? 1 : item.quantidade;
    const valorBase = Number(item.valor);


    return (valorBase + acrescimosTotal) * quantidade;
  };

  const total = items.reduce((acc, item) => {
    const splitItemsList = splitItems(item);
    return acc + splitItemsList.reduce((itemAcc, splitItem, index) => {
      return itemAcc + calculateItemTotal(splitItem, index);
    }, 0);
  }, 0);

  const handleAddAcrescimo = (itemNome: string, acrescimo: Acrescimo) => {
    setAcrescimos(prev => {
      const itemAcrescimos = prev[itemNome] || [];
      const existingAcrescimo = itemAcrescimos.find(a => a.nome === acrescimo.nome);

      if (existingAcrescimo) {
        console.log(itemAcrescimos);
        return {
          ...prev,
          [itemNome]: itemAcrescimos.map(a =>
            a.nome === acrescimo.nome
              ? { ...a, quantidade: a.quantidade + 1 }
              : a
          )
        };
      }

      return {
        ...prev,
        [itemNome]: [...itemAcrescimos, { nome: acrescimo.nome, quantidade: 1 }]
      };
    });
  };

  const handleRemoveAcrescimo = (itemNome: string, acrescimoNome: string) => {
    setAcrescimos(prev => {
      const itemAcrescimos = prev[itemNome] || [];
      const updatedAcrescimos = itemAcrescimos
        .map(a => 
          a.nome === acrescimoNome
            ? { ...a, quantidade: Math.max(0, a.quantidade - 1) }
            : a
        )
        .filter(a => a.quantidade > 0);

      return {
        ...prev,
        [itemNome]: updatedAcrescimos
      };
    });
  };

  const handleOpcaoChange = (itemNome: string, opcao: string) => {
    setOpcoesSelecionadas(prev => ({
      ...prev,
      [itemNome]: opcao
    }));
  };

  const handleWhatsAppOrder = () => {
    setIsLoading(true);
    try {
      const hora = new Date().getHours();
      let saudacao = "Boa noite";
      
      if (hora >= 5 && hora < 12) {
        saudacao = "Bom dia";
      } else if (hora >= 12 && hora < 18) {
        saudacao = "Boa tarde";
      }

      const message = `*${saudacao}! Gostaria de fazer o seguinte pedido:*\n\n${items
        .flatMap(item => {
          const splitItemsList = splitItems(item);
          return splitItemsList.map((splitItem, index) => {
            const itemTotal = calculateItemTotal(splitItem, index);
            
            let itemText = `${splitItem.quantidade}x --- ${splitItem.nome} - ${Number(splitItem.valor).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}`;
            
            const itemAcrescimos = acrescimos[`${item.nome}-${index}`] || [];
            if (itemAcrescimos.length > 0) {
              const acrescimosText = itemAcrescimos
                .map(a => {
                  const acrescimoInfo = acrescimosDisponiveis.find(ac => ac.nome === a.nome);
                  const valorAcrescimo = acrescimoInfo?.valor || 0;
                  return ` + ${a.quantidade}x -- ${a.nome} - ${(valorAcrescimo * a.quantidade).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}`;
                })
                .join('\n');
              itemText += '\n' + acrescimosText;
            }
            
            return itemText;
          });
        })
        .join("\n")}\n\n*Total do pedido:* ${total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })}\n----------------------------------------------\n*Local de Entrega*\nRegião: ${locationData.regiao || 'Não informada'}\nBairro: ${locationData.bairro}\nRua: ${locationData.rua}\nNúmero: ${locationData.numero}\nComplemento: ${locationData.complemento}\nObservação: ${locationData.observacao}\n\n*Valor da entrega:* ${DELIVERY_FEE}\n----------------------------------------------\n*Valor Total:* ${total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })} + Entrega`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/557399537643?text=${encodedMessage}`, "_blank");
      
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

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLocationModal(false);
    handleWhatsAppOrder();
  };

  const clearAcrescimos = () => {
    setAcrescimos({});
  };

  useEffect(() => {
    if (items.length === 0) {
      clearAcrescimos();
    }
  }, [items.length]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resumo do Pedido</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4">
              {items.flatMap((item, itemIndex) => {
                const splitItemsList = splitItems(item);
                
                return splitItemsList.map((splitItem, splitIndex) => (
                  <div key={`${splitItem.nome}-${splitIndex}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {splitItem.quantidade}x {splitItem.nome}
                          {splitItemsList.length > 1 && ` (${splitIndex + 1}/${splitItemsList.length})`}
                        </p>
                        <p className="text-sm text-muted-foreground">{splitItem.descricao}</p>
                      </div>
                      <p className="font-medium">
                        {calculateItemTotal(splitItem, splitIndex).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                    </div>
                    
                    {splitItem.opcoes && splitItem.opcoes.length > 0 && (
                      <select
                        className="w-full p-2 border rounded-md"
                        value={opcoesSelecionadas[`${splitItem.nome}-${splitIndex}`] || ''}
                        onChange={(e) => handleOpcaoChange(`${splitItem.nome}-${splitIndex}`, e.target.value)}
                      >
                        <option value="">Selecione uma opção</option>
                        {splitItem.opcoes.map((opcao) => (
                          <option key={opcao} value={opcao}>
                            {opcao}
                          </option>
                        ))}
                      </select>
                    )}

                    {acrescimosDisponiveis.length > 0 && splitItem.incrementavel && (
                      <div className="flex items-center gap-2">
                        <DialogAcrescimos>
                          <DialogTriggerAcrescimos asChild>
                            <Button variant="outline" size="sm">
                              Adicionar Acréscimos
                            </Button>
                          </DialogTriggerAcrescimos>
                          <DialogContentAcrescimos className="sm:max-w-[425px]">
                            <DialogHeaderAcrescimos>
                              <DialogTitleAcrescimos>Acréscimos Disponíveis</DialogTitleAcrescimos>
                            </DialogHeaderAcrescimos>
                            <div 
                              className="h-[300px] overflow-y-auto overscroll-contain"
                              onWheel={(e) => {
                                e.stopPropagation();
                                const container = e.currentTarget;
                                container.scrollTop += e.deltaY;
                              }}
                            >
                              <div className="space-y-4">
                                {acrescimosDisponiveis.map((acrescimo) => {
                                  const quantidade = acrescimos[`${item.nome}-${splitIndex}`]?.find(
                                    a => a.nome === acrescimo.nome
                                  )?.quantidade || 0;
                                  
                                  return (
                                    <div key={acrescimo.nome} className="flex items-center justify-between">
                                      <span>{acrescimo.nome}</span>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleRemoveAcrescimo(`${item.nome}-${splitIndex}`, acrescimo.nome)}
                                          disabled={quantidade === 0}
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <span>{quantidade}</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddAcrescimo(`${item.nome}-${splitIndex}`, acrescimo)}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </DialogContentAcrescimos>
                        </DialogAcrescimos>
                        
                        {acrescimos[`${item.nome}-${splitIndex}`]?.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {acrescimos[`${item.nome}-${splitIndex}`].map((acrescimo) => (
                              <div key={acrescimo.nome}>
                                {acrescimo.nome} x{acrescimo.quantidade}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ));
              })}
            </div>
          </ScrollArea>

          <div className="mt-6">
            <Separator />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-medium">
                {total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <Button 
              className="w-full mt-4 bg-neutral-900 hover:bg-neutral-800" 
              onClick={() => setShowLocationModal(true)}
              disabled={isLoading}
            >
              Enviar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informe sua localização</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="regiao" className="text-sm font-medium">Região</label>
              <select
                id="regiao"
                className="w-full p-2 border rounded-md"
                value={locationData.regiao}
                onChange={(e) => setLocationData(prev => ({ ...prev, regiao: e.target.value }))}
                required
              >
                <option value="Serra Grande">Serra Grande</option>
                <option value="Sargi">Sargi</option>
                <option value="Vila Badu">Vila Badu</option>
                <option value="Ecovila 1">Ecovila 1</option>
                <option value="Ecovila 2 antes">Ecovila 2 antes da antiga associação</option>
                <option value="Ecovila 2 depois">Ecovila 2 depois da antiga associação</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="bairro" className="text-sm font-medium">Bairro</label>
              <input
                id="bairro"
                className="w-full p-2 border rounded-md"
                value={locationData.bairro}
                onChange={(e) => setLocationData(prev => ({ ...prev, bairro: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="rua" className="text-sm font-medium">Rua</label>
              <input
                id="rua"
                className="w-full p-2 border rounded-md"
                value={locationData.rua}
                onChange={(e) => setLocationData(prev => ({ ...prev, rua: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="numero" className="text-sm font-medium">Número</label>
              <input
                id="numero"
                className="w-full p-2 border rounded-md"
                value={locationData.numero}
                onChange={(e) => setLocationData(prev => ({ ...prev, numero: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="complemento" className="text-sm font-medium">Complemento</label>
              <input
                id="complemento"
                className="w-full p-2 border rounded-md"
                value={locationData.complemento}
                onChange={(e) => setLocationData(prev => ({ ...prev, complemento: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="observacao" className="text-sm font-medium">Observação</label>
              <textarea
                id="observacao"
                className="w-full p-2 border rounded-md"
                value={locationData.observacao}
                onChange={(e) => setLocationData(prev => ({ ...prev, observacao: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Confirmar Pedido
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getDatabase, ref, update, remove } from "firebase/database";
import { useToast } from "@/components/ui/use-toast";
import app, { auth } from "@/firebase-config";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo: z.enum(["hamburguer", "bebida", "porcao", "sobremesa"]),
  subtipo: z.string().min(1, "Subtipo é obrigatório"),
  descricao: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  valor: z.string().refine((val) => !isNaN(Number(val)), "Valor deve ser um número"),
  incrementavel: z.boolean().default(false),
});

interface EditProductDialogProps {
  product: {
    id: string;
    nome: string;
    tipo: string;
    subtipo: string;
    descricao: string;
    valor: number;
    block: boolean;
    incrementavel: boolean;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdate: () => void;
}

export function EditProductDialog({ product, isOpen, onOpenChange, onProductUpdate }: EditProductDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: product.nome,
      tipo: product.tipo as "hamburguer" | "bebida" | "porcao" | "sobremesa",
      subtipo: product.subtipo,
      descricao: product.descricao,
      valor: product.valor.toString(),
      incrementavel: product.incrementavel || false,
    },
  });

  const subtipoOptions = {
    hamburguer: ["Tradicional", "Vegetariano", "Da casa"],
    bebida: ["Suco da Fruta", "Suco Da Polpa", "Refrigerante", "MilkShake", "Alcólico", "Água"],
    porcao: [],
    sobremesa: [],
  };

  const watchTipo = form.watch("tipo");

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tipo') {
        form.setValue('incrementavel', value.tipo === 'hamburguer');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    const db = getDatabase(app);
    const productRef = ref(db, `users/${user.uid}/produtos/${product.id}`);

    try {
      await update(productRef, {
        ...values,
        block: product.block,
      });
      
      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso",
      });
      onOpenChange(false);
      onProductUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Erro ao atualizar produto. Tente novamente.",
      });
      console.error("Erro ao atualizar produto", error);
    }
  }

  async function handleDelete() {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    const db = getDatabase(app);
    const productRef = ref(db, `users/${user.uid}/produtos/${product.id}`);

    try {
      await remove(productRef);
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso",
      });
      onOpenChange(false);
      onProductUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Erro ao excluir produto. Tente novamente.",
      });
      console.error("Erro ao excluir produto", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hamburguer">Hamburguer</SelectItem>
                      <SelectItem value="bebida">Bebida</SelectItem>
                      <SelectItem value="porcao">Porção</SelectItem>
                      <SelectItem value="sobremesa">Sobremesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={subtipoOptions[watchTipo as keyof typeof subtipoOptions].length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          subtipoOptions[watchTipo as keyof typeof subtipoOptions].length === 0 
                            ? "Não há subtipos disponíveis" 
                            : "Selecione o subtipo"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subtipoOptions[watchTipo as keyof typeof subtipoOptions].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="incrementavel"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={watchTipo !== 'hamburguer'}
                    />
                  </FormControl>
                  <FormLabel>Incrementável</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="destructive" 
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
              <Button type="submit" className="w-full">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
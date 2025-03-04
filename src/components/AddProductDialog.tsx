import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { getDatabase, ref, set, push} from "firebase/database";
import { useToast } from "@/components/ui/use-toast";
import { DialogClose } from "@/components/ui/dialog";
import app, { auth } from "@/firebase-config";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo: z.enum(["hamburguer", "bebida", "porcao", "sobremesa"]),
  subtipo: z.string().min(1, "Subtipo é obrigatório"),
  descricao: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  valor: z.string().refine((val) => !isNaN(Number(val)), "Valor deve ser um número"),
  block: z.boolean().default(false),
  incrementavel: z.boolean().default(false),
});

interface AddProductDialogProps {
  onAddProduct: (product: z.infer<typeof formSchema>) => void;
}

export function AddProductDialog({ onAddProduct }: AddProductDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: "hamburguer",
      subtipo: "",
      descricao: "",
      valor: "",
      incrementavel: false,
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    saveData(values);
  }

  const user = auth.currentUser;

  const saveData = async (values: any) => {
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }
    const userId = user.uid;
    const db = getDatabase(app);
    const newProductRef = push(ref(db, `users/${userId}/produtos`));
    const productData = {
      ...values,
      block: false,
    };
    set(newProductRef, productData).then(() => {
      toast({
        title: "Sucesso!",
        description: "Produto salvo com sucesso",
      });
      form.reset();
      setOpen(false);
      onAddProduct(productData);
    }).catch((error) => {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Erro ao salvar produto. Tente novamente.",
      });
      console.error("Erro ao salvar produto", error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Adicionar Produto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
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
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getDatabase, ref, update, remove } from "firebase/database";
import { useToast } from "@/components/ui/use-toast";
import app, { auth } from "@/firebase-config";
import { Trash2 } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  valor: z.string().refine((val) => !isNaN(Number(val)), "Valor deve ser um número"),
});

interface EditAcrescimoDialogProps {
  acrescimo: {
    id: string;
    nome: string;
    valor: number;
    block: boolean;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAcrescimoUpdate: () => void;
}

export function EditAcrescimoDialog({ 
  acrescimo, 
  isOpen, 
  onOpenChange,
  onAcrescimoUpdate
}: EditAcrescimoDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: acrescimo.nome,
      valor: acrescimo.valor.toString(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    const db = getDatabase(app);
    const acrescimoRef = ref(db, `users/${user.uid}/acrescimos/${acrescimo.id}`);

    try {
      await update(acrescimoRef, {
        ...values,
        block: acrescimo.block,
      });
      
      toast({
        title: "Sucesso!",
        description: "Acréscimo atualizado com sucesso",
      });
      onOpenChange(false);
      onAcrescimoUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Erro ao atualizar acréscimo. Tente novamente.",
      });
      console.error("Erro ao atualizar acréscimo", error);
    }
  }

  async function handleDelete() {
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    const db = getDatabase(app);
    const acrescimoRef = ref(db, `users/${user.uid}/acrescimos/${acrescimo.id}`);

    try {
      await remove(acrescimoRef);
      toast({
        title: "Sucesso!",
        description: "Acréscimo excluído com sucesso",
      });
      onOpenChange(false);
      onAcrescimoUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Erro ao excluir acréscimo. Tente novamente.",
      });
      console.error("Erro ao excluir acréscimo", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Acréscimo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do acréscimo" {...field} />
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/firebase-config";
import { getDatabase, ref, push, set } from "firebase/database";
import app from "@/firebase-config";
import React from "react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  valor: z.string().refine((val) => !isNaN(Number(val)), "Valor deve ser um número"),
  block: z.boolean().default(false),
});

interface AddAcrescimoDialogProps {
  onAddAcrescimo: (acrescimo: z.infer<typeof formSchema>) => void;
}

export function AddAcrescimoDialog({ onAddAcrescimo }: AddAcrescimoDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      valor: "",
    },
  });

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
    console.log(userId);
    const newAcrescimoRef = push(ref(db, `users/${userId}/acrescimos`));
    const acrescimoData = {
      ...values,
      block: false,
    };
    set(newAcrescimoRef, acrescimoData).then(() => {
      toast({
        title: "Sucesso!",
        description: "Acréscimo salvo com sucesso",
      });
      form.reset();
      setOpen(false);
      onAddAcrescimo(acrescimoData);
    }).catch((error) => {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Erro ao salvar acréscimo. Tente novamente.",
      });
      console.error("Erro ao salvar acréscimo", error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Adicionar Acréscimo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Acréscimo</DialogTitle>
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
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
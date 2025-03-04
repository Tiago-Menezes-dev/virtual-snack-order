import { Button } from "@/components/ui/button";
import { auth } from "@/firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AddProductDialog } from "@/components/AddProductDialog";
import { getDatabase, ref, get, update } from "firebase/database";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import app from "@/firebase-config";
import { EditProductDialog } from "@/components/EditProductDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddAcrescimoDialog } from "@/components/AddAcrescimoDialog";
import { EditAcrescimoDialog } from "@/components/EditAcrescimoDialog";
import { Ban, Eye, EyeOff } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase-config";

interface MenuItem {
  id: string;
  nome: string;
  tipo: string;
  subtipo: string;
  descricao: string;
  valor: number;
  block: boolean;
  incrementavel: boolean; 
}

// Add new interface for additions
interface Acrescimo {
  id: string;
  nome: string;
  valor: number;
  block: boolean;
}

// Adicione esta interface no início do arquivo, junto com as outras interfaces
interface Estabelecimento {
  id: string;
  imageUrl: string;
  userId: string;
  rota: string;
}

export function Painel() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [acrescimos, setAcrescimos] = useState<Acrescimo[]>([]); // New state
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAcrescimo, setSelectedAcrescimo] = useState<Acrescimo | null>(null);
  const [isEditAcrescimoDialogOpen, setIsEditAcrescimoDialogOpen] = useState(false);
  const [estabelecimentoData, setEstabelecimentoData] = useState<{ imageUrl?: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchAcrescimos();
    fetchEstabelecimentoData();
  }, []);

  // Add useEffect for click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    const db = getDatabase(app);
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }
    const userId = user.uid;
    const dbRef = ref(db, `users/${userId}/produtos`);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const itemsWithIds = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...(value as MenuItem)
      }));
      setMenuItems(itemsWithIds);
    } else {
      console.log("Nenhum dado encontrado");
    }
  }

  // Add new fetch function for additions
  const fetchAcrescimos = async () => {
    const db = getDatabase(app);
    const user = auth.currentUser;
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }
    const userId = user.uid;
    const dbRef = ref(db, `users/${userId}/acrescimos`);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const acrescimosWithIds = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...(value as Acrescimo)
      }));
      setAcrescimos(acrescimosWithIds);
    }
  };

  const fetchEstabelecimentoData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const estabelecimentoCollection = collection(db, "estabelecimento");
      const estabelecimentoSnapshot = await getDocs(estabelecimentoCollection);
      const estabelecimentos = estabelecimentoSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Estabelecimento));
      const matchingEstabelecimento = estabelecimentos.find((est: any) => est.userId === user.uid);

      if (matchingEstabelecimento) {
        setEstabelecimentoData({
          imageUrl: matchingEstabelecimento.imageUrl
        });
      }
    } catch (error) {
      console.error("Error fetching estabelecimento data:", error);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate("/");   
    });
  };


  const handleAddProduct = (product: any) => {
    // Immediately fetch updated data after product is added
    fetchData();
  };

  const handleBlockToggle = async (productId: string, currentBlockStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const db = getDatabase(app);
    const user = auth.currentUser;
    
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    try {
      const productRef = ref(db, `users/${user.uid}/produtos/${productId}`);
      await update(productRef, { block: !currentBlockStatus });
      // Atualiza o estado local
      setMenuItems(menuItems.map(item => 
        item.id === productId ? { ...item, block: !currentBlockStatus } : item
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Add new function to handle blocking additions
  const handleBlockAcrescimo = async (acrescimoId: string, currentBlockStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const db = getDatabase(app);
    const user = auth.currentUser;
    
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    try {
      const acrescimoRef = ref(db, `users/${user.uid}/acrescimos/${acrescimoId}`);
      await update(acrescimoRef, { block: !currentBlockStatus });
      setAcrescimos(acrescimos.map(item => 
        item.id === acrescimoId ? { ...item, block: !currentBlockStatus } : item
      ));
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleAddAcrescimo = (acrescimo: any) => {
    // Immediately fetch updated data after acrescimo is added
    fetchAcrescimos();
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Painel</h1>
        <div className="relative profile-menu-container">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
          >
            {estabelecimentoData?.imageUrl ? (
              <img 
                src={estabelecimentoData.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">?</span>
              </div>
            )}
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Itens do Menu</TabsTrigger>
          <TabsTrigger value="acrescimos">Acréscimos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="menu">
          {/* Cabeçalho do CRUD */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Controle do Menu</h2>
            <AddProductDialog onAddProduct={handleAddProduct} />
          </div>

          {/* Lista de cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                Não há produtos
              </div>
            ) : (
              menuItems.map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedProduct(item);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{item.nome}</h3>
                      <p className="text-gray-600">R$ {item.valor}</p>
                    </div>
                    <Button 
                      className={item.block ? "text-green-500 border-green-500 hover:text-green-600 hover:border-green-600" : "text-red-500 border-red-500 hover:text-red-600 hover:border-red-600"}
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleBlockToggle(item.id, item.block, e)}
                    >
                      {item.block ? <Eye /> : <EyeOff /> }
                      {item.block ? "Desbloquear" : "Bloquear"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="acrescimos">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Controle de Acréscimos</h2>
            <AddAcrescimoDialog onAddAcrescimo={handleAddAcrescimo} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acrescimos.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                Não há acréscimos
              </div>
            ) : (
              acrescimos.map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedAcrescimo(item);
                    setIsEditAcrescimoDialogOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{item.nome}</h3>
                      <p className="text-gray-600">R$ {item.valor}</p>
                    </div>
                    <Button
                      className={item.block ? "text-green-500 border-green-500 hover:text-green-600 hover:border-green-600" : "text-red-500 border-red-500 hover:text-red-600 hover:border-red-600"}
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleBlockAcrescimo(item.id, item.block, e)}
                    >
                      {item.block ? <Eye /> : <EyeOff /> }
                      {item.block ? "Desbloquear" : "Bloquear"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProductUpdate={fetchData}
        />
      )}

      {selectedAcrescimo && (
        <EditAcrescimoDialog
          acrescimo={selectedAcrescimo}
          isOpen={isEditAcrescimoDialogOpen}
          onOpenChange={setIsEditAcrescimoDialogOpen}
          onAcrescimoUpdate={fetchAcrescimos}
        />
      )}
    </div>
  );
}

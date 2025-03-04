import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import menuData from "@/data/menu.json";
import { MenuTabs } from "@/components/MenuTabs";
import { OrderSummary } from "@/components/OrderSummary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import { auth } from "@/firebase-config";
import app from "@/firebase-config";

interface MenuItem {
  id: string;
  nome: string;
  tipo: string;
  subtipo: string;
  descricao: string;
  valor: number;
  block: boolean;
}

const Menu = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [estabelecimentoData, setEstabelecimentoData] = useState<{
    imageUrl?: string;
    userId?: string;
  } | null>(null);
  const { items, clearCart } = useCart();
  const [menuData, setMenuData] = useState<any | null>({
    nome: "",
    tiposProdutos: ["hamburguer", "bebida", "porcao", "sobremesa"],
    produtos: []
  });
  
  const totalItems = items.reduce((acc, item) => acc + item.quantidade, 0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPath = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
    setCurrentPath(lastPath);
  }, [location]);

  useEffect(() => {
    const fetchEstabelecimento = async () => {
      try {
        const estabelecimentoCollection = collection(db, "estabelecimento");
        const estabelecimentoSnapshot = await getDocs(estabelecimentoCollection);

        const estabelecimentos = estabelecimentoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        const matchingEstabelecimento = estabelecimentos.find((estabelecimento: { rota: string , id: string , userId: string}) => estabelecimento.rota === currentPath);

        if (matchingEstabelecimento) {
          setEstabelecimentoData({
            imageUrl: matchingEstabelecimento.imageUrl,
            userId: matchingEstabelecimento.userId
          });
          
          setMenuData({
            nome: matchingEstabelecimento.nome,
            tiposProdutos: ["hamburguer", "bebida", "porcao", "sobremesa"],
            produtos: []
          });
          
          fetchData(matchingEstabelecimento.userId);
        }
      } catch (error) {
        console.error("Error fetching estabelecimento data:", error);
      }
    };

    if (currentPath) {
      fetchEstabelecimento();
    }
  }, [currentPath]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearCart = () => {
    clearCart();
    setShowOrderSummary(false);
  };

  const fetchData = async (userId: string) => {
    const db = getDatabase(app);
    const dbRef = ref(db, `users/${userId}/produtos`);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = Object.entries(snapshot.val())
        .map(([key, value]) => ({
          id: key,
          ...(value as MenuItem)
        }))
        .filter(item => !item.block);
      setMenuData(prevMenuData => ({
        ...prevMenuData,
        produtos: data
      }));
    } else {
      console.log("Nenhum dado encontrado");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 backdrop-blur-sm sticky top-0 z-10" style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/background.jpg")',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {estabelecimentoData?.imageUrl && (
              <img 
                src={estabelecimentoData.imageUrl} 
                alt="Profile" 
                className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg shadow-[rgba(0,_0,_0,_0.4)_0px_30px_90px]"
              />
            )}
            <h1 className="text-2xl font-bold text-white text-center font-lobster-two drop-shadow-lg">{menuData.nome}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          <MenuTabs menuData={menuData} />
        </div>
      </main>

      <footer className="border-t p-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-5xl mx-auto flex gap-2">
          {totalItems > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleClearCart}
              className="w-1/4 hover:bg-neutral-100"
            >
              Limpar
            </Button>
          )}
          <Button
            className={totalItems > 0 ? "w-3/4 bg-neutral-900 hover:bg-neutral-800" : "w-full bg-neutral-900 hover:bg-neutral-800"}
            size="lg"
            onClick={() => setShowOrderSummary(true)}
            disabled={totalItems === 0}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Ver Pedido
            {totalItems > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white text-black rounded-full">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </footer>

      <OrderSummary
        open={showOrderSummary}
        onOpenChange={setShowOrderSummary}
        items={items}
      />

      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-10 p-3 rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800 transition-all"
          aria-label="Voltar ao topo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Menu;

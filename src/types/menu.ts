
export interface Produto {
  tipo: string;
  nome: string;
  descricao: string;
  valor: number;
}

export interface ProdutoCarrinho extends Produto {
  quantidade: number;
}

export interface MenuData {
  tiposProdutos: string[];
  produtos: Produto[];
}

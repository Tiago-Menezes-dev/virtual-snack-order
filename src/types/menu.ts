
export interface Produto {
  tipo: string;
  nome: string;
  descricao: string;
  valor: number;
  subtipo: string;
}

export interface ProdutoCarrinho extends Produto {
  quantidade: number;
}

export interface MenuData {
  tiposProdutos: string[];
  produtos: Produto[];
}

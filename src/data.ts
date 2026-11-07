export interface Produto {
  id: number;
  sku: string;
  nome: string;
  categoria: string;
  marca: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  status: 'ok' | 'baixo' | 'zerado';
  fornecedor: string;
  descricao: string;
  imagem: string;
  naVitrine: boolean;
}

export interface Venda {
  id: number;
  cliente: string;
  total: number;
  status: 'pago' | 'enviado' | 'processando' | 'cancelado';
  data: string;
  itens: string[];
}

export interface Manutencao {
  id: number;
  hora: string;
  cliente: string;
  servico: string;
  bicicleta: string;
  status: 'concluido' | 'concluir' | 'iniciar';
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  totalCompras: number;
  ultimaVisita: string;
  bicicletas: number;
}

export interface Alerta {
  id: number;
  produto: string;
  sku: string;
  tipo: 'zerado' | 'baixo';
  tempo: string;
  estoque: number;
  estoqueMinimo: number;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&h=400&fit=crop&auto=format&q=80`;

export const categoryImages: Record<string, string> = {
  Transmissão: IMG('photo-1562615193-cbeef074a501'),
  Freios: IMG('photo-1637289031879-dc6acc591e3f'),
  Pneus: IMG('photo-1611237840223-3f47a5cf5634'),
  Rodas: IMG('photo-1618762098304-38e6b03db348'),
  Suspensão: IMG('photo-1760802192147-f12cad68337a'),
  Cockpit: IMG('photo-1421429167374-8fc8ab6d0f66'),
  Componentes: IMG('photo-1675798227643-da319f8ee8f7'),
  Conforto: IMG('photo-1765376260898-38e465a2cf6f'),
  Acessórios: IMG('photo-1421429167374-8fc8ab6d0f66'),
};

export const produtos: Produto[] = [
  {
    id: 1, sku: 'SKU-0042', nome: 'Câmbio Shimano Altus M2010', categoria: 'Transmissão', marca: 'Shimano',
    preco: 189.90, estoque: 0, estoqueMinimo: 5, status: 'zerado', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Câmbio traseiro Shimano Altus de 9 velocidades com tecnologia Shadow para pedal suave e eficiente. Compatível com cassetes de 11-36T. Excelente custo-benefício para trilhas e uso urbano.',
    imagem: categoryImages.Transmissão, naVitrine: true,
  },
  {
    id: 2, sku: 'SKU-0091', nome: 'Freio Tektro HD-E350', categoria: 'Freios', marca: 'Tektro',
    preco: 245.00, estoque: 0, estoqueMinimo: 4, status: 'zerado', fornecedor: 'Bike Parts SP',
    descricao: 'Sistema de freio hidráulico Tektro com alavancas ergonômicas e potência de frenagem consistente. Ideal para e-bikes e MTB. Pastilhas de resina incluídas, compatível com discos de 160/180mm.',
    imagem: categoryImages.Freios, naVitrine: true,
  },
  {
    id: 3, sku: 'SKU-0115', nome: 'Pneu Maxxis Ardent 29"', categoria: 'Pneus', marca: 'Maxxis',
    preco: 189.90, estoque: 7, estoqueMinimo: 20, status: 'baixo', fornecedor: 'Maxxis Brasil',
    descricao: 'Pneu MTB Maxxis Ardent com carcaça Dual Compound para máxima aderência em terrenos mistos. Peso leve e rolagem eficiente na terra, sem perder tração em curvas. Aro 29", largura 2.25".',
    imagem: categoryImages.Pneus, naVitrine: true,
  },
  {
    id: 4, sku: 'SKU-0078', nome: 'Corrente KMC X11', categoria: 'Transmissão', marca: 'KMC',
    preco: 89.90, estoque: 5, estoqueMinimo: 15, status: 'baixo', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Corrente KMC X11 de 11 velocidades com tratamento anti-ferrugem e construção de alta precisão. X-Bridge design para máxima eficiência de pedalada e durabilidade prolongada. Inclui quick-link.',
    imagem: categoryImages.Transmissão, naVitrine: true,
  },
  {
    id: 5, sku: 'SKU-0023', nome: 'Guidão Kalloy Uno 31.8', categoria: 'Cockpit', marca: 'Kalloy',
    preco: 65.00, estoque: 45, estoqueMinimo: 10, status: 'ok', fornecedor: 'Kalloy Brasil',
    descricao: 'Guidão de alumínio 6061 Kalloy Uno com rise de 25mm e largura de 720mm. Leve e robusto para uso em trilhas e ciclismo urbano. Rise muda o ângulo de controle para maior conforto.',
    imagem: categoryImages.Cockpit, naVitrine: true,
  },
  {
    id: 6, sku: 'SKU-0067', nome: 'Selim Selle San Marco Aspide', categoria: 'Conforto', marca: 'Selle San Marco',
    preco: 320.00, estoque: 12, estoqueMinimo: 5, status: 'ok', fornecedor: 'Import Sports',
    descricao: 'Selim de alta performance Selle San Marco Aspide com revestimento em couro sintético premium. Canal central para alívio de pressão. Trilhos em alumínio 7075. Peso: 230g. Para pedais longos com conforto de alto nível.',
    imagem: categoryImages.Conforto, naVitrine: true,
  },
  {
    id: 7, sku: 'SKU-0089', nome: 'Cubo Shimano Deore FH-MT500', categoria: 'Rodas', marca: 'Shimano',
    preco: 380.00, estoque: 8, estoqueMinimo: 3, status: 'ok', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Cubo traseiro Shimano Deore com padrão Micro Spline para cassetes de até 12 velocidades. 32 furos, selagem hermética para proteção em lama e chuva. Compatível com freio a disco de 6 parafusos.',
    imagem: categoryImages.Rodas, naVitrine: false,
  },
  {
    id: 8, sku: 'SKU-0034', nome: 'Pedal Wellgo B087 Alumínio', categoria: 'Componentes', marca: 'Wellgo',
    preco: 95.00, estoque: 23, estoqueMinimo: 8, status: 'ok', fornecedor: 'Bike Parts SP',
    descricao: 'Pedal plataforma em alumínio Wellgo B087 com pinos de aço inox removíveis para máximo grip. Rolamentos sellados, corpo amplo (102x98mm) para apoio confortável do pé em trilhas técnicas.',
    imagem: categoryImages.Componentes, naVitrine: true,
  },
  {
    id: 9, sku: 'SKU-0056', nome: 'Garfo Zoom 29" Suspensão 100mm', categoria: 'Suspensão', marca: 'Zoom',
    preco: 480.00, estoque: 3, estoqueMinimo: 10, status: 'baixo', fornecedor: 'Zoom Sports',
    descricao: 'Garfo de suspensão Zoom com curso de 100mm, pernas de alumínio e sistema air/oil para regulagem de dureza. Compatível com freio a disco, tubo liso 1-1/8". Ideal para trilhas moderadas e uso urbano.',
    imagem: categoryImages.Suspensão, naVitrine: true,
  },
  {
    id: 10, sku: 'SKU-0099', nome: 'Roda Dianteira SunRingle 29"', categoria: 'Rodas', marca: 'SunRingle',
    preco: 650.00, estoque: 6, estoqueMinimo: 3, status: 'ok', fornecedor: 'Import Sports',
    descricao: 'Roda dianteira SunRingle montada com aro Duroc 30 e cubo Shimano Deore. Raios duplo cruzado para maior resistência em descidas. 28 raios, freio a disco. Compatível com thru-axle 15mm.',
    imagem: categoryImages.Rodas, naVitrine: false,
  },
  {
    id: 11, sku: 'SKU-0012', nome: 'Espigão Kalloy 90mm', categoria: 'Cockpit', marca: 'Kalloy',
    preco: 35.00, estoque: 30, estoqueMinimo: 10, status: 'ok', fornecedor: 'Kalloy Brasil',
    descricao: 'Espigão (stem) Kalloy em alumínio 6061, comprimento 90mm, ângulo de 6°. Fixação 4 parafusos, compatível com guidões de 31.8mm e garfos 1-1/8". Peso: 145g.',
    imagem: categoryImages.Cockpit, naVitrine: false,
  },
  {
    id: 12, sku: 'SKU-0088', nome: 'Aro Alex Rims Supra 29"', categoria: 'Rodas', marca: 'Alex Rims',
    preco: 220.00, estoque: 15, estoqueMinimo: 5, status: 'ok', fornecedor: 'Import Sports',
    descricao: 'Aro Alex Rims Supra em alumínio 6061 para aro 29". Perfil duplo de 30mm para maior rigidez lateral. 32 furos, compatível com discos de freio, largura interna 21mm. Peso: 520g.',
    imagem: categoryImages.Rodas, naVitrine: false,
  },
  {
    id: 13, sku: 'SKU-0044', nome: 'Disco Shimano SM-RT56 180mm', categoria: 'Freios', marca: 'Shimano',
    preco: 75.00, estoque: 4, estoqueMinimo: 10, status: 'baixo', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Disco de freio Shimano SM-RT56 de 180mm em aço inox. Furo central para maior dissipação de calor. Compatível com todos os sistemas de freio a disco Shimano. Fix 6 parafusos.',
    imagem: categoryImages.Freios, naVitrine: true,
  },
  {
    id: 14, sku: 'SKU-0071', nome: 'Cassete Shimano CS-M7000 11v', categoria: 'Transmissão', marca: 'Shimano',
    preco: 495.00, estoque: 9, estoqueMinimo: 5, status: 'ok', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Cassete Shimano SLX de 11 velocidades, configuração 11-46T. Sprockets de aço e alumínio para peso reduzido. Ampla variação de marchas para subidas e descidas mais exigentes.',
    imagem: categoryImages.Transmissão, naVitrine: true,
  },
  {
    id: 15, sku: 'SKU-0103', nome: 'Câmara Schwalbe 29" SV', categoria: 'Pneus', marca: 'Schwalbe',
    preco: 48.90, estoque: 42, estoqueMinimo: 20, status: 'ok', fornecedor: 'Schwalbe Brasil',
    descricao: 'Câmara de ar Schwalbe para aro 29" com válvula Presta (SV). Fabricada em borracha de alta qualidade para máxima retenção de ar. Compatível com pneus de 1.9" a 2.35". Peso: 180g.',
    imagem: categoryImages.Pneus, naVitrine: true,
  },
  {
    id: 16, sku: 'SKU-0055', nome: 'Suporte Monoplato SRAM Shorty', categoria: 'Transmissão', marca: 'SRAM',
    preco: 185.00, estoque: 0, estoqueMinimo: 5, status: 'zerado', fornecedor: 'SRAM Brasil',
    descricao: 'Suporte de monoplato SRAM com guia de corrente integrado para uso sem bandeja. Elimina quedas de corrente em terrenos acidentados. Compatível com eixo-passante e BB shell 73mm.',
    imagem: categoryImages.Transmissão, naVitrine: false,
  },
  {
    id: 17, sku: 'SKU-0039', nome: 'Manete Shimano BL-MT501', categoria: 'Freios', marca: 'Shimano',
    preco: 145.00, estoque: 11, estoqueMinimo: 5, status: 'ok', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Manete de freio hidráulico Shimano MT501 com alavanca ajustável em 2 posições. Corpo em alumínio, compatível com cilindros mestre de 4 pistões. Encaixe em guidões de 22.2mm.',
    imagem: categoryImages.Freios, naVitrine: true,
  },
  {
    id: 18, sku: 'SKU-0082', nome: 'Suporte Computador GUB G-85', categoria: 'Acessórios', marca: 'GUB',
    preco: 42.00, estoque: 25, estoqueMinimo: 8, status: 'ok', fornecedor: 'Bike Parts SP',
    descricao: 'Suporte de computador/GPS GUB G-85 em alumínio CNC. Rotação de 360° para ajuste perfeito. Compatível com guidões de 22.2mm a 31.8mm. Abertura rápida sem ferramentas. Peso: 28g.',
    imagem: categoryImages.Acessórios, naVitrine: true,
  },
  {
    id: 19, sku: 'SKU-0017', nome: 'Rolamento Cuvete 1-1/8"', categoria: 'Componentes', marca: 'Token',
    preco: 58.00, estoque: 50, estoqueMinimo: 15, status: 'ok', fornecedor: 'Import Sports',
    descricao: 'Rolamento de cuvete Token para garfos 1-1/8" com retentores sellados. Par superior/inferior incluso. Alta durabilidade e rotação suave. Compatível com a maioria dos quadros modernos.',
    imagem: categoryImages.Componentes, naVitrine: false,
  },
  {
    id: 20, sku: 'SKU-0006', nome: 'Kit Parafusos Allen M5 (20 pçs)', categoria: 'Componentes', marca: 'Genérico',
    preco: 18.00, estoque: 120, estoqueMinimo: 30, status: 'ok', fornecedor: 'Fixadores Brasil',
    descricao: 'Kit com 20 parafusos Allen M5 em aço inox com comprimentos variados (10, 12, 16 e 20mm). Ideal para manutenção geral de bicicletas, fixação de componentes do cockpit e freios.',
    imagem: categoryImages.Componentes, naVitrine: false,
  },
  {
    id: 21, sku: 'SKU-0029', nome: 'Manivela Shimano FC-MT500 170mm', categoria: 'Transmissão', marca: 'Shimano',
    preco: 298.00, estoque: 7, estoqueMinimo: 5, status: 'ok', fornecedor: 'Ciclo Distribuidora',
    descricao: 'Manivela Shimano FC-MT500 de braço único (monoplato) com comprimento de 170mm. Eixo Hollowtech II para leveza e rigidez. Compatível com 10/11v e correntes 1/2" x 11/128".',
    imagem: categoryImages.Transmissão, naVitrine: true,
  },
  {
    id: 22, sku: 'SKU-0063', nome: 'Amortecedor RockShox Judy Silver 29"', categoria: 'Suspensão', marca: 'RockShox',
    preco: 1250.00, estoque: 2, estoqueMinimo: 2, status: 'ok', fornecedor: 'SRAM Brasil',
    descricao: 'Garfo de suspensão RockShox Judy Silver com sistema TurnKey de 120mm. Câmara de ar solo para ajuste de dureza, rebound externo. Pernas de 32mm, travamento lockout. Para XC e trail 29".',
    imagem: categoryImages.Suspensão, naVitrine: true,
  },
];

export const vendas: Venda[] = [
  { id: 4821, cliente: 'João Mendes', total: 592, status: 'pago', data: '28/05/2026 09:15', itens: ['Pneu Maxxis Ardent 29"', 'Câmara Schwalbe 29"', 'Corrente KMC X11'] },
  { id: 4820, cliente: 'Maria Costa', total: 189, status: 'enviado', data: '28/05/2026 09:02', itens: ['Câmbio Shimano Altus M2010'] },
  { id: 4819, cliente: 'Pedro Luz', total: 847, status: 'processando', data: '27/05/2026 16:44', itens: ['Amortecedor RockShox Judy Silver', 'Kit Parafusos Allen M5'] },
  { id: 4818, cliente: 'Laura Ferreira', total: 234, status: 'pago', data: '27/05/2026 14:30', itens: ['Selim Selle San Marco Aspide'] },
  { id: 4817, cliente: 'Carlos Eduardo', total: 1240, status: 'pago', data: '27/05/2026 11:22', itens: ['Garfo Zoom 29"', 'Manivela Shimano FC-MT500', 'Cassete Shimano CS-M7000'] },
  { id: 4816, cliente: 'Ana Beatriz', total: 380, status: 'enviado', data: '27/05/2026 09:50', itens: ['Cubo Shimano Deore FH-MT500'] },
  { id: 4815, cliente: 'Roberto Santos', total: 95, status: 'pago', data: '26/05/2026 17:05', itens: ['Pedal Wellgo B087 Alumínio'] },
  { id: 4814, cliente: 'Fernanda Lima', total: 560, status: 'cancelado', data: '26/05/2026 14:20', itens: ['Roda Dianteira SunRingle 29"'] },
  { id: 4813, cliente: 'Marcos Oliveira', total: 145, status: 'pago', data: '26/05/2026 10:30', itens: ['Manete Shimano BL-MT501'] },
  { id: 4812, cliente: 'Julia Andrade', total: 428, status: 'pago', data: '25/05/2026 15:45', itens: ['Freio Tektro HD-E350', 'Disco Shimano SM-RT56'] },
];

export const manutencoes: Manutencao[] = [
  { id: 1, hora: '09:00', cliente: 'Carlos Ribeiro', servico: 'Revisão Completa + Troca de Câmbio', bicicleta: 'Trek Marlin 7 · 29"', status: 'concluido' },
  { id: 2, hora: '10:30', cliente: 'Ana Paula Lima', servico: 'Troca de Freios Hidráulicos', bicicleta: 'Specialized Rockhopper · 27.5"', status: 'concluir' },
  { id: 3, hora: '11:00', cliente: 'Roberto Alves', servico: 'Regulagem de Marchas', bicicleta: 'Scott Scale 970 · 29"', status: 'concluir' },
  { id: 4, hora: '14:00', cliente: 'Fernanda Souza', servico: 'Troca de Pneus + Câmara', bicicleta: 'Giant Talon 3 · 29"', status: 'iniciar' },
  { id: 5, hora: '15:30', cliente: 'Marcos Gomes', servico: 'Instalação de Pedivela Deore', bicicleta: 'Caloi Elite · 29"', status: 'iniciar' },
  { id: 6, hora: '16:30', cliente: 'Julia Martins', servico: 'Revisão Geral + Lubrificação', bicicleta: 'Oggi 7.1 · 29"', status: 'iniciar' },
  { id: 7, hora: '17:00', cliente: 'Diego Carvalho', servico: 'Troca de Corrente + Cassete', bicicleta: 'Merida Matts · 29"', status: 'iniciar' },
  { id: 8, hora: '17:30', cliente: 'Camila Nunes', servico: 'Alinhamento de Rodas', bicicleta: 'Trek Dual Sport 2 · 28"', status: 'iniciar' },
];

export const clientes: Cliente[] = [
  { id: 1, nome: 'Carlos Ribeiro', email: 'carlos.ribeiro@email.com', telefone: '(11) 99234-5678', totalCompras: 3456.90, ultimaVisita: '28/05/2026', bicicletas: 2 },
  { id: 2, nome: 'Ana Paula Lima', email: 'anapaula@email.com', telefone: '(21) 98765-4321', totalCompras: 1890.50, ultimaVisita: '28/05/2026', bicicletas: 1 },
  { id: 3, nome: 'Roberto Alves', email: 'roberto.alves@email.com', telefone: '(31) 97654-3210', totalCompras: 780.00, ultimaVisita: '28/05/2026', bicicletas: 1 },
  { id: 4, nome: 'Fernanda Souza', email: 'fernanda.s@email.com', telefone: '(11) 91234-9876', totalCompras: 2340.00, ultimaVisita: '28/05/2026', bicicletas: 3 },
  { id: 5, nome: 'Marcos Gomes', email: 'marcos.gomes@email.com', telefone: '(47) 99876-5432', totalCompras: 560.00, ultimaVisita: '28/05/2026', bicicletas: 1 },
  { id: 6, nome: 'Julia Martins', email: 'julia.m@email.com', telefone: '(61) 98234-7890', totalCompras: 4120.00, ultimaVisita: '28/05/2026', bicicletas: 2 },
  { id: 7, nome: 'João Mendes', email: 'joao.mendes@email.com', telefone: '(11) 99000-1234', totalCompras: 1850.00, ultimaVisita: '27/05/2026', bicicletas: 1 },
  { id: 8, nome: 'Maria Costa', email: 'maria.costa@email.com', telefone: '(21) 97890-4567', totalCompras: 890.00, ultimaVisita: '27/05/2026', bicicletas: 1 },
  { id: 9, nome: 'Pedro Luz', email: 'pedro.luz@email.com', telefone: '(41) 98765-1234', totalCompras: 2780.00, ultimaVisita: '27/05/2026', bicicletas: 2 },
  { id: 10, nome: 'Laura Ferreira', email: 'laura.f@email.com', telefone: '(85) 99123-8765', totalCompras: 1230.00, ultimaVisita: '27/05/2026', bicicletas: 1 },
];

export const alertas: Alerta[] = [
  { id: 1, produto: 'Câmbio Shimano Altus M2010', sku: 'SKU-0042', tipo: 'zerado', tempo: 'há 2h', estoque: 0, estoqueMinimo: 5 },
  { id: 2, produto: 'Freio Tektro HD-E350', sku: 'SKU-0091', tipo: 'zerado', tempo: 'há 4h', estoque: 0, estoqueMinimo: 4 },
  { id: 3, produto: 'Pneu Maxxis Ardent 29"', sku: 'SKU-0115', tipo: 'baixo', tempo: 'há 6h', estoque: 7, estoqueMinimo: 20 },
  { id: 4, produto: 'Corrente KMC X11', sku: 'SKU-0078', tipo: 'baixo', tempo: 'há 8h', estoque: 5, estoqueMinimo: 15 },
  { id: 5, produto: 'Suporte Monoplato SRAM Shorty', sku: 'SKU-0055', tipo: 'zerado', tempo: 'há 1 dia', estoque: 0, estoqueMinimo: 5 },
];

export const chartData = [
  { semana: 'S1', vendas: 3200, manutencoes: 15 },
  { semana: 'S2', vendas: 4100, manutencoes: 22 },
  { semana: 'S3', vendas: 3800, manutencoes: 18 },
  { semana: 'S4', vendas: 5200, manutencoes: 28 },
  { semana: 'S5', vendas: 4600, manutencoes: 24 },
  { semana: 'S6', vendas: 3900, manutencoes: 20 },
  { semana: 'S7', vendas: 4820, manutencoes: 8 },
];

export type ViewId =
  | 'dashboard' | 'estoque' | 'produtos'
  | 'vendas' | 'clientes'
  | 'manutencoes' | 'agenda' | 'alertas'
  | 'relatorios' | 'configuracoes';

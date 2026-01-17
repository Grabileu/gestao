# Sistema de Gestão

Sistema de gestão para controle de ausências, quebras de caixa e compras da Ceasa.

## Instalação

```bash
npm install
```

## Executar o servidor

```bash
npm run server
```

ou

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Endpoints da API

### Health Check
- `GET /api/health` - Verifica o status do servidor

### Absences (Ausências)
- `GET /api/absences` - Lista todas as ausências
- `POST /api/absences` - Cria uma nova ausência
- `PUT /api/absences/:id` - Atualiza uma ausência
- `DELETE /api/absences/:id` - Exclui uma ausência

### Cash Breaks (Quebras de Caixa)
- `GET /api/cashbreaks` - Lista todas as quebras de caixa
- `POST /api/cashbreaks` - Cria uma nova quebra de caixa
- `PUT /api/cashbreaks/:id` - Atualiza uma quebra de caixa
- `DELETE /api/cashbreaks/:id` - Exclui uma quebra de caixa

### Ceasa Purchases (Compras Ceasa)
- `GET /api/ceasa-purchases` - Lista todas as compras
- `POST /api/ceasa-purchases` - Cria uma nova compra
- `PUT /api/ceasa-purchases/:id` - Atualiza uma compra
- `DELETE /api/ceasa-purchases/:id` - Exclui uma compra

### Dados Auxiliares
- `GET /api/employees` - Lista todos os funcionários
- `GET /api/stores` - Lista todas as lojas
- `GET /api/cashiers` - Lista todos os caixas

## Estrutura do Projeto

```
gestao/
├── Pages/               # Páginas da aplicação
├── server.js           # Servidor Express
├── package.json        # Dependências do projeto
├── .env               # Variáveis de ambiente
└── README.md          # Documentação
```

## Configuração

Configure as variáveis de ambiente no arquivo `.env`:
- `PORT` - Porta do servidor (padrão: 3000)
- `NODE_ENV` - Ambiente de execução

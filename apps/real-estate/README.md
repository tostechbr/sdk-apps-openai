# 🏢 Real Estate Map - SDK App Case

Uma aplicação de demonstração de **Imobiliária Inteligente** que combina a IA do ChatGPT com mapas interativos em tempo real. Este projeto exemplifica como modelos de linguagem podem "enxergar" e manipular interfaces geográficas complexas.

## ✨ Funcionalidades

- **🗺️ Mapa Interativo:** Integração nativa com **Google Maps API**.
- **🔍 Busca Inteligente:** O ChatGPT entende intenções como "quero um apê nos Jardins" ou "imóveis até 1 milhão".
- **🎨 Dark Mode Premium:** Interface visual moderna e totalmente responsiva.
- **⚡ Filtragem em Tempo Real:**
    - Filtragem por tipo (Casa, Apartamento, Studio).
    - Filtragem por faixa de preço e localização.
- **📱 Cards Interativos:** Clique no card para destacar o imóvel no mapa; clique no pin para ver detalhes.

---

## 🏗️ Arquitetura Técnica

Esta aplicação é composta por dois componentes principais que se comunicam via **Model Context Protocol (MCP)**:

### 1. MCP Server (Backend)
Desenvolvido em **TypeScript**, expõe ferramentas (Tools) que o ChatGPT pode chamar:

- `search_properties(filter?: string)`: Busca imóveis, opcionalmente filtrando por tipo ('casa' | 'apartamento').
- `filter_by_price(maxPrice: number)`: Filtra imóveis abaixo de um valor específico.
- `GET /mcp`: Endpoint SSE (Server-Sent Events) para conexão persistente.

### 2. Widget UI (Frontend)
Um arquivo único otimizado (`public/widget.html`) que contém:
- Lógica de renderização do Google Maps.
- Gerenciamento de estado local (markers, infowindows).
- Estilização customizada (CSS in JS) para carregamento instantâneo.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- Chave de API do Google Maps (opcional para dev, configurada por padrão)

### Passo a Passo

1. **Instale as dependências:**
   ```bash
   cd apps/real-estate
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *O servidor iniciará na porta `8787`.*

3. **Teste com o MCP Inspector:**
   Esta é a melhor forma de validar as tools sem gastar tokens do ChatGPT.
   
   ```bash
   npx @modelcontextprotocol/inspector sse http://localhost:8787/mcp
   ```
   
   > ⚠️ **Atenção:** No Inspector, certifique-se de selecionar **"Server-Sent Events"** no menu "Transport Type" antes de conectar.

---

## 🧪 Guia de Testes (Prompts)

Para validar a funcionalidade, use os seguintes prompts no Inspector ou no ChatGPT:

| Teste | Prompt Sugerido | Resultado Esperado |
|-------|-----------------|--------------------|
| **Busca Geral** | "Mostre todos os imóveis disponíveis." | Mapa com 5 pinos e lista completa. |
| **Filtro Tipo** | "Estou procurando apenas apartamentos." | Mapa com 3 pinos (Jardins, Itaim, Moema). |
| **Filtro Preço** | "Quais imóveis custam mais de 1.5 milhão?" | Mapa com 2 pinos (Jardins e Pinheiros). |
| **Range** | "Tem algo entre 900 mil e 1.2 milhão?" | Apenas 1 pino (Vila Madalena). |
| **Complexo** | "Mostre apartamentos nos Jardins acima de 1 milhão." | Filtragem combinada correta. |

---

## 📦 Estrutura do Projeto

```bash
apps/real-estate/
├── public/
│   └── widget.html       # O "frontend" renderizado no ChatGPT
├── src/
│   └── config/           # Configurações de ambiente
├── server.ts             # Servidor MCP principal
├── tsconfig.json         # Configuração TypeScript
└── package.json
```

## 🛠️ Customização

Para adicionar seus próprios imóveis, edite a constante `MOCK_PROPERTIES` no arquivo `server.ts`. Em um cenário real, isso seria substituído por uma consulta ao banco de dados SQL/NoSQL.

---

**[Voltar para o Repositório Principal](../../README.md)**

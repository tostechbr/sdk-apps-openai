# OpenAI SDK Apps - Use Cases Gallery 🚀

Bem-vindo ao repositório oficial de exemplos e casos de uso do **OpenAI Apps SDK**. Este projeto reúne aplicações práticas desenvolvidas com o *Model Context Protocol (MCP)*, demonstrando como criar experiências ricas e interativas diretamente no ChatGPT.

🔗 **Repositório:** [https://github.com/tostechbr/sdk-apps-openai](https://github.com/tostechbr/sdk-apps-openai)

## 🎯 O que são SDK Apps?

SDK Apps são integrações que permitem ao ChatGPT não apenas "falar", mas também **mostrar** e **interagir**. Eles combinam a inteligência do modelo de linguagem com interfaces visuais (widgets) renderizadas em tempo real.

Este repositório serve como um guia vivo de implementação, evoluindo de projeto para projeto com arquiteturas e padrões reutilizáveis.

---

## 📚 Casos de Uso (Use Cases)

### 1. 🏢 Real Estate Map (Imobiliária Inteligente)
*Uma experiência completa de busca de imóveis com mapas interativos.*

O ChatGPT atua como um corretor inteligente que pode:
- Buscar imóveis por tipo (Casa, Apartamento, Studio).
- Filtrar por faixa de preço e localização.
- Exibir resultados em um **Mapa Interativo (Google Maps)** dentro do chat.
- Mostrar cards detalhados com fotos e preços.

**Destaques Técnicos:**
- **Visualização:** Google Maps API com marcadores personalizados e clusters.
- **Protocolo:** MCP (Server-Sent Events) para comunicação bidirecional.
- **Interatividade:** O clique no card do imóvel foca o mapa e abre detalhes.
- **UX:** Dark Mode premium e responsivo.

📂 **Código Fonte:** [`apps/real-estate/`](apps/real-estate/README.md)

---

### 2. ⏳ Próximos Use Cases (Em Breve)
Novos exemplos estão sendo desenvolvidos para explorar outras capacidades do SDK:
- **Finance Dashboard:** Gráficos interativos de ações e despesas.
- **Travel Planner:** Itinerários de viagem com mapas e reservas.
- **E-commerce:** Vitrine de produtos com carrinho de compras.

---

## 🛠️ Stack Tecnológica

Todos os apps neste repositório seguem um padrão moderno e robusto:

- **Protocolo:** [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- **Runtime:** Node.js (v18+)
- **Linguagem:** TypeScript (para tipagem segura e DX)
- **Transport:** HTTP com Server-Sent Events (SSE)
- **Frontend:** Vanilla JS / HTML5 (para widgets leves e rápidos)

## 🚀 Como Começar

1. Clone o repositório:
```bash
git clone https://github.com/tostechbr/sdk-apps-openai.git
cd sdk-apps-openai
```

2. Escolha um App e instale as dependências:
```bash
cd apps/real-estate
npm install
```

3. Configure as variáveis de ambiente (ex: API Keys):
```bash
cp .env.example .env
```

4. Rode localmente e teste com o **MCP Inspector**:
```bash
npm run dev
npx @modelcontextprotocol/inspector sse http://localhost:8787/mcp
```

## 🤝 Contribuindo

Quer adicionar um novo Use Case?
1. Crie uma nova pasta em `apps/`.
2. Siga a estrutura padrão (server.ts, public/widget.html).
3. Documente seu "Use Case" aqui no README principal.

## 📄 Licença

MIT License - sinta-se livre para usar esses exemplos como base para seus próprios produtos.

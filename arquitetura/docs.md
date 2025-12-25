# Sistema de Agendamento Médico (MCP Learning Project)

## Visão Geral
Este projeto tem como objetivo o aprendizado prático e incremental de **MCP (Model Context Protocol)**, **OpenAI SDK** e interação com **Supabase**.
Desenvolveremos um sistema de agendamento médico, começando pelo banco de dados, passando pela exposição de dados via recursos MCP, permitindo ações via ferramentas e finalizando com a integração na OpenAI.

## Arquitetura e Dados

### Banco de Dados (Supabase)
Utilizaremos o Supabase (PostgreSQL) desde o início, mesmo para dados simulados (mock data).
Isso nos permite praticar MCP com um backend real.

#### Entidades Propostas
- **Doctor**
    - `id`: UUID (PK)
    - `name`: Text
    - `specialty`: Text (ex: Cardiologista, Pediatra)
    - `location`: Text (Endereço legível)
    - `coordinates`: GeoJSON ou (lat, long) - *Para futuro uso em mapas*
    - `available_slots`: JSON/Table (Horários livres simplificados para início)

- **Appointment**
    - `id`: UUID (PK)
    - `doctor_id`: UUID (FK)
    - `patient_name`: Text
    - `scheduled_at`: Timestamp

## Estrutura MCP (Model Context Protocol)

### 1. Recursos (Resources) - Fase de Leitura
Os recursos expõem dados do banco para o modelo ler.
- `doctor://list`:
    - Retorna lista completa de médicos.
    - Suporta filtro por especialidade? (Talvez via `doctor://list?specialty=cardio` ou filtragem no prompt).
- `doctor://{id}/details`:
    - Detalhes do médico, incluindo localização e especialidade.

### 2. Ferramentas (Tools) - Fase de Ação
As ferramentas permitem que o modelo execute operações no banco.
- `list_doctors_by_specialty(specialty: string)`:
    - Retorna médicos filtrados.
- `get_doctor_availability(doctor_id: string)`:
    - Retorna horários disponíveis.
- `schedule_appointment(doctor_id: string, time: string, patient_name: string)`:
    - Insere o agendamento no banco.

### 3. Prompts - Fase de Comportamento
- `receptionist`: Define a persona do assistente, instruindo-o a perguntar a especialidade desejada ou localidade antes de listar opções.

## Roteiro de Implementação (Refinado)

### Fase 1: Fundação & Dados (Supabase)
- Configurar projeto Supabase via MCP (`supabase-mcp-server`).
- Criar Tabelas (`doctors`, `appointments`) via MCP (`execute_sql` ou migration).
- Inserir **Dados Mock** (médicos fictícios com endereços/coords e especialidades) diretamente no banco.

### Fase 2: Instalação do SDK & Configuração
- Configurar o ambiente com `@modelcontextprotocol/sdk`.
- Estruturar o servidor MCP TypeScript.
- Referência: `arquitetura/sdk-openai/Build-your-MCP-server.md`.

### Fase 3: Implementação de Recursos (Resources)
- Implementar `doctor://...`.
- Conectar servidor MCP ao Supabase para leitura.
- **Teste**: Verificar leitura dos dados via MCP Inspector.

### Fase 4: Implementação de Ferramentas (Tools)
- Implementar `schedule_appointment` e filtros.
- Lógica de disponibilidade.
- **Teste**: Executar ferramentas via Inspector e verificar persistência no Supabase.

### Fase 5: Prompts & Integração OpenAI
- Criar prompts do sistema.
- Integrar com OpenAI SDK (`arquitetura/sdk-openai/Connect-from-ChatGPT.md`).
- Teste fluxo completo via chat (Listar -> Escolher -> Agendar).

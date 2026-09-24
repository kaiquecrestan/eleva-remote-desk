# Arquitetura de Negócio e Licenciamento: Eleva Remote

Este documento estabelece o modelo de posicionamento de mercado, precificação por planos corporativos e a arquitetura técnica planejada para controle de acesso, conexões simultâneas e integração entre **Eleva Remote Desk** e **Eleva Remote Wake**.

---

## 1. Posicionamento Estratégico do Produto

O **Eleva Remote** não compete no mercado de suporte técnico avulso (ad-hoc / helpdesk emergencial descartável). O foco é **Infraestrutura Própria de Home Office e Acesso Contínuo a Servidores e Estações de Trabalho**.

### Cenário Principal de Uso
1. **Ambiente de Trabalho Fixo (Host):**
   - O computador físico do escritório ou servidor corporativo fica pré-configurado com o **Instalador Completo do Eleva Remote Desk**.
   - O software roda continuamente como **Serviço do Windows / Daemon do Linux**, permitindo acesso antes mesmo do login do Windows (tela de boas-vindas / Ctrl+Alt+Del) e após reinicializações.
2. **Ligar sob Demanda (Remote Wake):**
   - A máquina de trabalho pode permanecer desligada ou em suspensão (S3/S5) para economia de energia.
   - O colaborador aciona o **Remote Wake** via Painel Web (`remote.elevabs.com`) ou aplicativo para ligar o computador remotamente via rede local / hardware dedicado.
3. **Trabalho Remoto Seguro (Home Office):**
   - Assim que o computador inicia, o colaborador assume o controle da máquina de casa via **Eleva Remote Desk**, com criptografia de ponta a ponta e latência ultrabaixa.

---

## 2. Modelo de Monetização e Planos

Nesse modelo contínuo, a cobrança é estruturada por organização através de três eixos fundamentais:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MÉTRICAS DO PLANO PAGO                          │
├──────────────────────────┬─────────────────────────┬───────────────────┤
│ Computadores Gerenciados │ Conexões Simultâneas    │ Assentos / Users  │
│ (Endpoints Cadastrados)  │ (Canais Concorrentes)   │ (Operadores)      │
├──────────────────────────┼─────────────────────────┼───────────────────┤
│ Ex: 3, 10, 50 ou 100 PCs │ Ex: 1, 2, 5 ou ilimitado│ Ex: 1 por conta   │
│ vinculados à empresa     │ usando ao mesmo tempo   │ ou múltiplos users│
└──────────────────────────┴─────────────────────────┴───────────────────┘
```

### Recursos por Nível de Plano

| Recurso | Plano Básico / Starter | Plano Pro / Equipe | Plano Enterprise |
| :--- | :--- | :--- | :--- |
| **Computadores Gerenciados** | Até 3 máquinas | Até 15 máquinas | Ilimitado / Customizado |
| **Conexões Simultâneas** | 1 canal ativo por vez | 3 canais simultâneos | 10+ canais dedicados |
| **Integração Remote Wake** | Até 3 dispositivos | Ilimitado | Ilimitado com relatórios |
| **Acesso Não Assistido** | Permanente (24/7) | Permanente (24/7) | Permanente + Grupos |
| **Isolamento de Usuários** | Não (acesso global) | Sim (por colaborador) | Sim (RBAC avançado) |
| **Auditoria e Logs de Sessão**| Últimos 7 dias | Últimos 90 dias | Ilimitado (LGPD) |

---

## 3. Arquitetura da Trava de Licenciamento e Acesso

Para proteger os servidores de relay (`desk.elevabs.com`) e garantir que apenas clientes adimplentes utilizem a infraestrutura, a arquitetura planejada possui dois componentes:

```text
                     ┌──────────────────────────────────┐
                     │    Colaborador (Home Office)     │
                     └────────────────┬─────────────────┘
                                      │ 1. Login com conta da empresa
                                      ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                    Eleva Remote API (api-remote.elevabs.com)                  │
├───────────────────────────────────────────────────────────────────────────────┤
│ - Valida status da assinatura (Stripe / Mercado Pago / Supabase)              │
│ - Verifica quota de PCs gerenciados (device_count <= plan.max_devices)        │
│ - Controla canais simultâneos (active_sessions < plan.max_concurrency)       │
└───────────────────────┬───────────────────────────────┬───────────────────────┘
                        │                               │
            2. Lista PCs autorizados        3. Autoriza nova conexão
                        │                               │
                        ▼                               ▼
     ┌────────────────────────────────────┐ ┌───────────────────────────────────┐
     │          Remote Wake API           │ │     Dokploy Relay (Port 21117)    │
     │   (Dispara pacote Wake-on-LAN)     │ │  (Estabelece sessão P2P / Relay)  │
     └─────────────────┬──────────────────┘ └─────────────────┬─────────────────┘
                       │                                      │
                       ▼                                      ▼
     ┌──────────────────────────────────────────────────────────────────────────┐
     │                       Máquina do Escritório (Host)                       │
     │            (Roda Eleva Remote Desk como Serviço de Sistema)              │
     └──────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Máquina Host (Escritório / Servidor)
- Instalada via instalador silencioso ou setup com `ENROLL_TOKEN` da empresa.
- Registra seu UUID e hardware no Supabase/API com status `unattended_ready = true`.
- Permanece em escuta contínua no `hbbs` (porta 21116) mesmo com o Windows bloqueado ou sem usuário logado.

### 3.2. Máquina Client (Home Office)
- Exige **login obrigatório** com e-mail corporativo e senha/Magic Link.
- Ao abrir o app, não expõe campo de conexão aberta para IDs de terceiros desconhecidos; em vez disso, carrega a **lista de computadores autorizados da empresa**.
- Exibe o status da máquina:
  - 🟢 **Online:** Botão *"Conectar"* ativo.
  - 🔴 **Desligado / Suspenso:** Botão *"Ligar Computador (Remote Wake)"* ativo.
  - 🟡 **Iniciando:** Aguardando handshake de boot.

### 3.3. Controle de Conexões Simultâneas em Tempo Real
1. Ao clicar em **"Conectar"**, o client envia requisição para a API:
   ```http
   POST /api/v1/sessions/acquire
   Authorization: Bearer <user_jwt>
   Body: { "target_device_id": "123456789" }
   ```
2. A API consulta a tabela `active_sessions`:
   - Conta as sessões da mesma organização com `ended_at IS NULL` e `last_heartbeat > NOW() - INTERVAL '60 SECONDS'`.
   - Se `active_count >= plan.max_concurrency`, retorna:
     ```json
     {
       "error": "CONCURRENCY_LIMIT_REACHED",
       "message": "Todas as conexões simultâneas do seu plano estão em uso."
     }
     ```
   - O aplicativo exibe uma mensagem clara:
     > *"Limite de conexões do plano atingido. Aguarde outro operador desconectar ou faça upgrade do seu plano."*
3. Se houver vaga disponível:
   - Registra a nova sessão na tabela `active_sessions`.
   - Retorna o token de autorização para o cliente iniciar o handshake no relay.
   - O cliente mantém um heartbeat a cada 30 segundos.
   - Ao fechar a janela remota, dispara `POST /api/v1/sessions/release`, liberando a vaga imediatamente.

---

## 4. Conformidade com a Licença AGPL-3.0

Para manter 100% de segurança jurídica e integridade de propriedade intelectual:
* O **Eleva Remote Desk** (código deste repositório) comunica-se com a **API Eleva Remote** exclusivamente via chamadas de rede HTTP REST / WebSocket externas.
* A inteligência de cobrança, faturamento, banco de dados Supabase e regras comerciais residem na **Eleva Remote Platform**, totalmente isoladas e privadas.

---

## 5. Roteiro de Implementação Futura (Quando for Executar)

- [ ] **Fase 1 (Banco de Dados & API):**
  - Criação da tabela `active_sessions` no Supabase com gatilhos de timeout/heartbeat.
  - Endpoints `/sessions/acquire` e `/sessions/release` com validação de plano na tabela de assinaturas.
- [ ] **Fase 2 (Cliente Desktop - Modo Corporativo):**
  - Implementação de tela inicial de login obrigatório no Flutter Desktop.
  - Substituição da tela genérica de ID avulso por lista de dispositivos vinculados do usuário.
  - Interceptação do evento de conexão para validação de concorrência com a API.
- [ ] **Fase 3 (Instalador Corporativo / Enrollment):**
  - Parâmetro no instalador silencioso Windows (ex: `ElevaRemoteDesk-Setup-x64.exe /token=ORG_TOKEN`) para registrar novos servidores sem intervenção manual.
- [ ] **Fase 4 (Integração Total com Remote Wake):**
  - Botão de acionamento de Wake-on-LAN diretamente no card do computador desligado antes de abrir a sessão.

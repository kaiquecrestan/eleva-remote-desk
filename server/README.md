# Eleva Remote Server Stack (Dokploy)

Backend completo para o ecossistema **Eleva Remote (Desk & Wake)** com autenticação multi-tenant, sincronização de computadores (Address Book), controle de planos/limites e suporte a hardware de inicialização remota.

---

## 🚀 Como subir no Dokploy

1. **Acesse o seu painel do Dokploy.**
2. Crie um novo **Compose Project** (ou selecione seu servidor).
3. **Opção A (Deploy via Git):**
   * Conecte o repositório `kaiquecrestan/eleva-remote-desk`.
   * Configure o **Root Directory** como `/server`.
   * Configure o arquivo compose como `docker-compose.yml`.
4. **Opção B (Deploy Direto pelo Editor Compose):**
   * Copie o conteúdo de `server/docker-compose.yml` e cole na aba de Compose do Dokploy.
5. Defina as variáveis de ambiente baseadas no `.env.example`.
6. Clique em **Deploy**.

---

## 🌐 Configuração do DNS no Cloudflare / Domínio

No painel do seu domínio `elevabs.com`, crie os seguintes apontamentos tipo **A** para o IP da sua VPS:

| Tipo | Nome | Conteúdo / Destino | Proxy Cloudflare |
|---|---|---|:---:|
| A | `desk` | `IP_DA_SUA_VPS` | **DNS Only (Cinza)** ⚠️ |
| A | `api-remote` | `IP_DA_SUA_VPS` | Ativo ou DNS Only |
| A | `remote` | `IP_DA_SUA_VPS` | Ativo ou DNS Only |

> ⚠️ **IMPORTANTE:** O subdomínio `desk.elevabs.com` utiliza portas TCP/UDP diretas (21115-21119) para o streaming de vídeo do Remote Desk. No Cloudflare, ele deve estar marcado como **DNS Only (Nuvem Cinza)**.

---

## 🔑 Obter a Chave Pública do `hbbs` (Se desejar gerar nova)

Se você quiser visualizar a chave pública gerada automaticamente pelo container `hbbs` na VPS:
```bash
docker exec -it eleva-remote-hbbs cat /root/id_ed25519.pub
```
Por padrão, o cliente `Eleva Remote Desk` já possui a chave `lgVtWWXXcESrw+SAurhht5h8aU6sTkvaqdI05IHTZuY=` pré-configurada.

---

## 🛠️ Endpoints Principais da API (`https://api-remote.elevabs.com`)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` | Healthcheck do serviço |
| `POST` | `/api/login` | Login do usuário/cliente (e-mail + senha) ➡️ retorna token JWT |
| `GET` | `/api/currentUser` | Perfil do cliente e limites do plano |
| `GET` | `/api/ab` | Lista completa de computadores vinculados à conta |
| `POST` | `/api/ab/peer/add/:guid` | Cadastra novo computador (bloqueia se exceder o plano) |
| `POST` | `/api/audit/conn` | Registra conexão e valida limite simultâneo do plano |
| `POST` | `/api/audit/close` | Libera o slot da conexão simultânea |
| `POST` | `/api/heartbeat` | Mantém computadores com status online em tempo real |
| `POST` | `/api/wake/telemetry` | Recebe leitura em Watts do hardware Eleva Remote Wake |
| `POST` | `/api/wake/trigger` | Dispara comando para ligar o computador (WoL / relé) |
| `POST` | `/api/admin/provision-initial`| Provisiona a primeira organização e usuário administrador |

# Eleva Remote Desk
## Especificação funcional e técnica para desenvolvimento

**Produto principal:** Eleva Remote  
**Módulo:** Eleva Remote Desk  
**Base tecnológica:** fork do RustDesk Open Source  
**Objetivo deste documento:** orientar a equipe de desenvolvimento na criação de um cliente de acesso remoto com identidade Eleva, integrado ao ecossistema Eleva Remote, preservando compatibilidade com a infraestrutura RustDesk self-hosted e observando as obrigações da licença AGPL-3.0.

---

# 1. Visão geral

O **Eleva Remote** será a plataforma da Eleva para acesso, gestão e operação remota de computadores.

Dentro dessa plataforma existirão diferentes módulos. O primeiro deles será:

> **Eleva Remote Desk**

O Eleva Remote Desk será o aplicativo responsável por permitir acesso remoto aos computadores dos clientes, utilizando como base o projeto open source RustDesk.

A intenção não é apenas redistribuir o RustDesk com outro nome.

O projeto deverá possuir:

- identidade visual própria;
- instalador próprio;
- servidor próprio;
- configuração automática;
- experiência simplificada para o usuário final;
- integração futura com o restante do Eleva Remote;
- possibilidade de atualização controlada pela Eleva;
- possibilidade futura de comunicação com recursos de Wake-on-LAN e hardware auxiliar;
- separação clara entre o código derivado do RustDesk e os demais serviços proprietários da Eleva.

---

# 2. Arquitetura conceitual

O Eleva Remote deverá ser tratado como a plataforma.

```text
Eleva Remote
│
├── Eleva Remote Desk
│   └── Cliente de acesso remoto
│
├── Eleva Remote Wake
│   ├── Wake-on-LAN
│   └── Integração futura com ESP8266 / hardware
│
├── Painel Eleva Remote
│   ├── Empresas
│   ├── Usuários
│   ├── Dispositivos
│   ├── Permissões
│   └── Assinaturas
│
└── Serviços de infraestrutura
    ├── RustDesk ID Server
    ├── RustDesk Relay Server
    ├── APIs Eleva
    └── Banco de dados
```

O **Eleva Remote Desk** deverá ser considerado apenas uma das partes do produto.

---

# 3. Estratégia de desenvolvimento

O cliente deverá ser desenvolvido a partir do **código-fonte do RustDesk**, e não a partir de modificação de binários oficiais já compilados.

Fluxo recomendado:

1. criar um fork interno/controlado do repositório oficial;
2. definir uma versão-base do RustDesk;
3. criar uma branch própria para o Eleva Remote Desk;
4. aplicar as alterações de branding;
5. aplicar a configuração padrão da infraestrutura Eleva;
6. compilar o aplicativo;
7. assinar os executáveis;
8. publicar a versão correspondente do código-fonte exigido pela licença;
9. distribuir apenas builds geradas pelo pipeline da Eleva.

---

# 4. Nome do produto

Nome principal:

> **Eleva Remote Desk**

Nome curto permitido na interface:

> **Remote Desk**

Nome do produto pai:

> **Eleva Remote**

Evitar utilizar "RustDesk" como nome comercial do aplicativo.

O nome RustDesk deverá aparecer apenas onde for necessário para:

- atribuição;
- licença;
- créditos;
- documentação técnica;
- informações de software open source utilizado.

---

# 5. Branding

O cliente deverá substituir a identidade visual padrão pelo branding da Eleva.

Alterar:

- nome do aplicativo;
- ícone;
- logo;
- splash screen, caso existente;
- título das janelas;
- textos institucionais;
- nome exibido no menu Iniciar;
- nome exibido em "Aplicativos instalados";
- nome do executável, quando tecnicamente viável;
- nome do instalador;
- ícones de atalhos;
- metadados do executável;
- informações exibidas em "Sobre".

Sugestão de executável:

```text
ElevaRemoteDesk.exe
```

Sugestão de instalador:

```text
ElevaRemoteDesk-Setup-x64.exe
```

---

# 6. Tela principal

A tela principal deverá permanecer simples.

Informações essenciais:

```text
Eleva Remote Desk

Seu ID
XXXXXXXXX

Senha temporária
XXXXXXXX

[ Conectar a outro dispositivo ]

ID remoto
[________________]

[ Conectar ]
```

Não sobrecarregar a tela com recursos administrativos.

O usuário final deve enxergar apenas o necessário para:

- informar seu ID;
- informar a senha quando necessário;
- conectar em outro computador;
- visualizar o estado da conexão;
- acessar configurações essenciais.

---

# 7. Servidor Eleva pré-configurado

O usuário não deverá precisar configurar manualmente:

- ID Server;
- Relay Server;
- chave pública;
- endpoints internos.

Essas informações deverão ser inseridas automaticamente no cliente.

Exemplo conceitual:

```text
ID Server:
remote.elevabusinesssolutions.com.br

Relay Server:
relay.elevabusinesssolutions.com.br
```

Os domínios definitivos deverão ser configuráveis em build/configuração e não espalhados diretamente pelo código.

Criar constantes/configuração centralizada.

Exemplo:

```text
ELEVA_REMOTE_ID_SERVER=
ELEVA_REMOTE_RELAY_SERVER=
ELEVA_REMOTE_PUBLIC_KEY=
ELEVA_REMOTE_API_URL=
```

---

# 8. Infraestrutura RustDesk

O ambiente deverá utilizar servidor RustDesk self-hosted.

Componentes principais:

### hbbs

Responsável por:

- identificação;
- rendezvous;
- negociação inicial das conexões.

### hbbr

Responsável pelo relay quando a conexão direta P2P não puder ser estabelecida.

O sistema deverá priorizar conexão direta sempre que possível.

O relay deverá ser utilizado somente quando necessário.

---

# 9. Atualização automática

O Eleva Remote Desk deverá possuir mecanismo próprio de atualização.

Fluxo desejado:

```text
Cliente inicia
↓
Consulta API de atualização
↓
Verifica versão atual
↓
Existe versão mais nova?
↓
Sim
↓
Baixa instalador/pacote assinado
↓
Valida integridade
↓
Solicita ou executa atualização
```

A API poderá inicialmente retornar algo semelhante a:

```json
{
  "version": "1.0.3",
  "download_url": "...",
  "sha256": "...",
  "mandatory": false
}
```

Nunca executar atualização sem validar:

- origem;
- assinatura;
- hash;
- versão.

---

# 10. Versionamento

Não utilizar apenas a versão original do RustDesk como versão comercial.

Sugestão:

```text
Eleva Remote Desk 1.0.0
Base RustDesk: 1.x.x
```

No repositório interno deve ser possível identificar exatamente qual commit upstream originou cada versão.

Exemplo:

```text
ELEVA_VERSION=1.0.0
UPSTREAM_RUSTDESK_VERSION=1.x.x
UPSTREAM_COMMIT=<hash>
```

Isso é importante tanto para manutenção quanto para conformidade de licença.

---

# 11. Tela "Sobre"

Criar uma tela própria.

Exemplo:

```text
Eleva Remote Desk
Versão 1.0.0

© Eleva Business Solutions

Eleva Remote Desk utiliza software open source
derivado do projeto RustDesk.

O código derivado do RustDesk é disponibilizado
sob os termos da GNU Affero General Public License v3.

[ Licenças de código aberto ]
[ Código-fonte correspondente ]
```

A identidade principal da tela deverá ser da Eleva.

---

# 12. Licença e conformidade

## 12.1 Base

O cliente RustDesk e o RustDesk Server OSS são publicados sob a licença:

> GNU Affero General Public License v3.0 — AGPL-3.0

A equipe NÃO deverá remover avisos de copyright/licença existentes sem análise.

---

## 12.2 Código-fonte

Toda versão distribuída do Eleva Remote Desk derivada do RustDesk deverá ter seu **código-fonte correspondente** disponibilizado conforme as exigências aplicáveis da AGPL.

A versão publicada deverá corresponder à versão efetivamente distribuída.

Evitar disponibilizar apenas:

- código upstream original;
- versão mais recente;
- código de outra build.

Deve ser possível relacionar:

```text
Eleva Remote Desk 1.0.0
→ código-fonte da build 1.0.0
```

---

# 13. Repositório público

Criar um repositório específico para o código derivado.

Sugestão:

```text
github.com/elevabusiness/eleva-remote-desk
```

ou equivalente.

O repositório deverá conter pelo menos:

```text
README.md
LICENSE
NOTICE / THIRD_PARTY_NOTICES
código-fonte
instruções de build
referência ao projeto original
```

O README deverá explicar que o projeto é baseado no RustDesk.

---

# 14. Crédito ao projeto original

Inserir atribuição clara, mas discreta.

Sugestão:

```text
Eleva Remote Desk é baseado no projeto open source RustDesk.
RustDesk é disponibilizado sob a GNU Affero General Public License v3.0.
```

Não é necessário transformar "RustDesk" na marca principal da interface.

A atribuição poderá ficar em:

```text
Configurações
→ Sobre
→ Licenças de código aberto
```

---

# 15. Marca RustDesk

Não utilizar:

- logotipo oficial do RustDesk como identidade do Eleva Remote Desk;
- identidade visual que sugira produto oficial da RustDesk;
- nomes comerciais como "RustDesk Eleva";
- comunicação que implique parceria oficial sem autorização.

Usar:

> Eleva Remote Desk

Como descrição técnica/documental:

> baseado no projeto open source RustDesk.

---

# 16. Separação entre open source e propriedade intelectual Eleva

Este ponto é importante.

O cliente derivado do RustDesk deverá ficar isolado do restante da plataforma.

Arquitetura sugerida:

```text
┌───────────────────────────────┐
│ Eleva Remote Desk             │
│ fork do RustDesk              │
│ AGPL                          │
└──────────────┬────────────────┘
               │ API
               ▼
┌───────────────────────────────┐
│ Eleva Remote Platform         │
│                               │
│ autenticação                  │
│ billing                       │
│ empresas                      │
│ dispositivos                  │
│ permissões                    │
│ Wake-on-LAN                   │
│ automações                    │
│ painel                        │
└───────────────────────────────┘
```

A integração deverá preferencialmente ocorrer por APIs/protocolos claramente definidos.

Evitar copiar lógica proprietária da plataforma para dentro do fork quando não for necessário.

---

# 17. Integração futura com Eleva Remote

Preparar o cliente para posteriormente receber um identificador interno de dispositivo.

Exemplo:

```text
device_uuid
organization_id
device_name
device_token
```

Isso permitirá vincular:

```text
Empresa
↓
Unidade
↓
Computador
↓
Eleva Remote Desk
↓
RustDesk ID
```

Exemplo:

```text
Cláudia Modas
├── Caixa 01
│   └── RustDesk ID: 123456789
├── Caixa 02
│   └── RustDesk ID: 987654321
└── Escritório
    └── RustDesk ID: 456789123
```

---

# 18. Device UUID

Não utilizar somente o ID do RustDesk como identificador principal no sistema Eleva.

Criar um UUID próprio do Eleva Remote.

Exemplo:

```text
device_uuid:
a3aa21de-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Esse UUID deverá identificar permanentemente o equipamento dentro do ecossistema Eleva.

---

# 19. Registro de dispositivo

Futuramente, durante a instalação:

```text
Instalador
↓
Gera/obtém device_uuid
↓
Registra na API Eleva
↓
Obtém configuração
↓
Configura Remote Desk
↓
Inicia serviço
```

Payload conceitual:

```json
{
  "device_uuid": "...",
  "hostname": "PC-CAIXA-01",
  "os": "Windows 11",
  "rustdesk_id": "123456789",
  "remote_desk_version": "1.0.0"
}
```

Não enviar informações desnecessárias.

---

# 20. Segurança

O projeto deverá seguir os seguintes princípios:

- conexões criptografadas;
- TLS nas APIs Eleva;
- segredo/token nunca salvo em texto puro quando evitável;
- assinatura de builds;
- validação de updates;
- logs sem exposição de senhas;
- proteção contra alteração maliciosa das configurações;
- menor privilégio possível;
- controle de acesso por organização;
- possibilidade futura de revogação de dispositivo.

---

# 21. Senhas

Não desenvolver mecanismos próprios de armazenamento de senha sem necessidade.

Quando uma senha permanente for habilitada:

- nunca registrar em log;
- não enviar em telemetria;
- armazenar utilizando os mecanismos seguros disponíveis no cliente/SO;
- evitar exposição em arquivos de configuração legíveis.

---

# 22. Acesso não supervisionado

O produto deverá suportar acesso não supervisionado.

Casos de uso:

- computador de caixa;
- servidor;
- computador administrativo;
- máquinas de clientes sob suporte;
- computadores pessoais autorizados.

As permissões deverão ser configuráveis.

---

# 23. Serviço no Windows

A versão Windows deverá poder instalar o Eleva Remote Desk como serviço.

Objetivos:

- funcionar após reinicialização;
- funcionar antes de login do usuário;
- permitir acesso remoto sem depender de abertura manual;
- permitir atualização controlada;
- obter ID mesmo após reboot.

---

# 24. Instalação silenciosa

Preparar suporte a instalação automatizada.

Exemplo conceitual:

```powershell
ElevaRemoteDesk-Setup.exe --silent-install
```

Se possível, manter compatibilidade com os parâmetros upstream úteis do RustDesk.

O RustDesk já oferece mecanismos como instalação silenciosa e configuração por linha de comando, que podem ser aproveitados no projeto.

---

# 25. Provisionamento

No futuro, desejamos algo semelhante a:

```text
https://remote.eleva.com.br/install/EMPRESA_TOKEN
```

O instalador ou script:

1. instala o Eleva Remote Desk;
2. configura o servidor;
3. registra o computador;
4. vincula à empresa;
5. inicia o serviço;
6. informa o dispositivo no painel.

---

# 26. Wake-on-LAN

O Eleva Remote Desk deverá ser preparado para integração com o módulo Wake.

Não implementar necessariamente no primeiro release.

O painel poderá futuramente possuir:

```text
[ Acessar ]

[ Ligar computador ]
```

Fluxo:

```text
Usuário clica em "Ligar"
↓
API Eleva Remote
↓
Agente local / gateway
↓
Magic Packet WoL
↓
Computador inicia
↓
Remote Desk conecta
```

---

# 27. Eleva Remote Wake Hardware

Em ambientes onde WoL não funcionar corretamente, poderá existir o dispositivo físico baseado inicialmente em ESP8266.

Fluxo:

```text
Eleva Remote
↓
Cloud/API
↓
Eleva Remote Wake
↓
ESP8266
↓
pulso no botão Power
↓
computador liga
```

Isso deverá ser tratado como outro módulo.

Não incorporar essa lógica diretamente ao código do RustDesk se não houver necessidade.

---

# 28. Telemetria Eleva

Implementar somente telemetria necessária.

Exemplos aceitáveis:

```text
device online/offline
versão instalada
SO
última comunicação
status do serviço
RustDesk ID
```

Evitar coletar:

- conteúdo da tela;
- clipboard;
- arquivos;
- teclas;
- conteúdo da sessão;

salvo quando alguma funcionalidade futura exigir isso de maneira explícita, transparente e autorizada.

---

# 29. Logs

Criar logs locais estruturados para diagnóstico.

Exemplo:

```text
[INFO] service_started
[INFO] registered_server
[INFO] relay_connected
[WARN] update_check_failed
[ERROR] api_connection_failed
```

Jamais registrar:

```text
password
session secret
private key
authentication token completo
```

---

# 30. Assinatura de código

Antes de distribuir comercialmente, utilizar assinatura de código.

Windows:

- certificado de Code Signing;
- assinatura do instalador;
- assinatura do executável.

Objetivo:

- reduzir alertas do SmartScreen;
- provar autenticidade;
- reduzir risco de alteração;
- melhorar confiança no instalador.

---

# 31. Pipeline de build

Criar CI/CD reproduzível.

Fluxo recomendado:

```text
commit/tag
↓
CI
↓
compilação
↓
testes
↓
geração dos artefatos
↓
assinatura
↓
SHA-256
↓
release
↓
publicação do source correspondente
```

---

# 32. Estratégia de atualização do upstream

Não alterar indiscriminadamente o fork.

Manter:

```text
upstream/rustdesk
eleva/main
eleva/release
```

Fluxo:

```text
RustDesk lança nova versão
↓
avaliar changelog
↓
merge controlado
↓
resolver conflitos
↓
testar branding
↓
testar infraestrutura
↓
testar acesso remoto
↓
gerar release Eleva
```

---

# 33. Alterações mínimas no core

Sempre que possível:

> alterar pouco o core do RustDesk.

Priorizar:

- configuração;
- assets;
- branding;
- wrappers;
- módulos independentes;
- chamadas API externas.

Isso facilitará atualizações futuras do upstream.

---

# 34. MVP

O MVP do Eleva Remote Desk deverá incluir:

- [ ] fork controlado do RustDesk;
- [ ] nome Eleva Remote Desk;
- [ ] logo Eleva;
- [ ] ícone próprio;
- [ ] servidor ID pré-configurado;
- [ ] servidor relay pré-configurado;
- [ ] chave pública pré-configurada;
- [ ] instalador Windows;
- [ ] serviço Windows;
- [ ] acesso remoto funcional;
- [ ] acesso não supervisionado;
- [ ] tela Sobre personalizada;
- [ ] informações de licença;
- [ ] link para código-fonte correspondente;
- [ ] pipeline de build;
- [ ] versionamento Eleva;
- [ ] assinatura de executável;
- [ ] atualização básica.

---

# 35. Não faz parte do MVP

Deixar para fases posteriores:

- painel administrativo completo;
- cobrança;
- multiempresa avançado;
- usuários e permissões;
- aplicativo mobile próprio;
- ESP8266;
- Wake-on-LAN em nuvem;
- inventário avançado;
- RMM;
- execução de scripts;
- monitoramento de CPU/RAM;
- gerenciamento de patches;
- transferência centralizada de arquivos;
- auditoria avançada de sessões.

---

# 36. Segunda fase

Após estabilizar o cliente:

## Eleva Remote Platform

Desenvolver:

- cadastro de empresas;
- cadastro de usuários;
- dispositivos;
- agrupamento por empresa;
- grupos de dispositivos;
- status online/offline;
- botão conectar;
- Wake-on-LAN;
- histórico;
- permissões;
- billing.

---

# 37. UX esperada para o cliente

O Eleva Remote Desk deve transmitir:

- simplicidade;
- confiança;
- segurança;
- produto empresarial;
- identidade Eleva.

Evitar transformar o cliente em um painel administrativo complexo.

Administração deve ficar majoritariamente no:

> Painel Eleva Remote

O Desk deve ser o agente/aplicativo de acesso.

---

# 38. Estrutura sugerida de repositórios

```text
eleva-remote/
│
├── eleva-remote-desk/
│   └── fork RustDesk / AGPL
│
├── eleva-remote-api/
│
├── eleva-remote-panel/
│
├── eleva-remote-wake/
│
└── eleva-remote-infra/
```

É importante que o repositório derivado do RustDesk fique separado dos serviços proprietários.

---

# 39. Documentação interna obrigatória

Manter dentro do projeto:

```text
/docs
```

Arquivos sugeridos:

```text
ARCHITECTURE.md
BUILD.md
DEPLOY.md
UPSTREAM.md
BRANDING.md
LICENSE_COMPLIANCE.md
RELEASE.md
SECURITY.md
```

---

# 40. LICENSE_COMPLIANCE.md

Este arquivo deverá registrar pelo menos:

```text
Projeto upstream:
RustDesk

Licença upstream:
AGPL-3.0

Versão upstream utilizada:
...

Commit upstream:
...

Versão Eleva:
...

Alterações relevantes:
...

Local do código-fonte correspondente:
...
```

Preencher isso a cada release.

---

# 41. Política de releases

Cada release deverá gerar:

```text
ElevaRemoteDesk-x.x.x.exe
SHA256SUMS.txt
source-x.x.x.zip
CHANGELOG.md
```

Ou equivalente.

O código correspondente também poderá ser publicado por tag Git:

```text
v1.0.0
v1.0.1
v1.1.0
```

---

# 42. Critério de aceite do MVP

O MVP será considerado pronto quando:

1. um Windows limpo receber o instalador;
2. o usuário instalar sem configurar servidor manualmente;
3. o serviço iniciar automaticamente;
4. o computador receber um ID;
5. outro Eleva Remote Desk conseguir acessá-lo;
6. a conexão utilizar a infraestrutura Eleva;
7. o programa sobreviver a reboot;
8. o acesso não supervisionado funcionar;
9. atualização puder ser distribuída;
10. a build puder ser reproduzida pelo pipeline;
11. a versão correspondente do source estiver publicada;
12. créditos/licença estiverem acessíveis no aplicativo.

---

# 43. Prioridade de implementação

### P0 — obrigatório

- fork;
- build;
- branding;
- servidor Eleva;
- conexão;
- serviço;
- licença;
- source correspondente.

### P1 — muito importante

- instalador;
- assinatura;
- updater;
- registro de dispositivo;
- API Eleva.

### P2 — evolução

- painel;
- multiempresa;
- Wake-on-LAN;
- provisionamento;
- ESP8266;
- automações.

---

# 44. Decisão de produto

O RustDesk deverá ser tratado como:

> motor/base tecnológica do Eleva Remote Desk.

Ele não deverá ser tratado como o produto inteiro.

O produto comercial será:

> **Eleva Remote**

E o cliente de desktop será:

> **Eleva Remote Desk**

Isso permite que no futuro a Eleva substitua componentes internos sem precisar alterar a identidade comercial do produto.

---

# 45. Observação jurídica

Esta especificação não substitui revisão jurídica especializada.

Antes de uma distribuição comercial em escala, revisar:

- AGPL-3.0;
- arquivos de licença efetivamente presentes na versão upstream escolhida;
- avisos de copyright;
- termos aplicáveis ao uso da marca RustDesk;
- processo utilizado para disponibilizar o código-fonte correspondente;
- eventual utilização de outras dependências com licenças próprias.

A equipe deve assumir como regra conservadora:

> qualquer modificação distribuída no código derivado do RustDesk deve permanecer rastreável, com licença e código-fonte correspondente acessíveis.

---

# 46. Referências técnicas

Documentação oficial útil para a equipe:

- RustDesk — Client Configuration
- RustDesk — Client Deployment
- RustDesk — Advanced Settings
- RustDesk — Client
- RustDesk Server OSS
- GNU Affero General Public License v3.0

A documentação atual do RustDesk informa que clientes self-hosted podem ser configurados com `ID Server`, chave pública e Relay, e que o projeto suporta instalação/configuração automatizada por linha de comando. A documentação também diferencia o gerador oficial de cliente personalizado do Server Pro do fluxo OSS, no qual nossa personalização será mantida através do fork próprio.

---

# 47. Resumo para o time

O objetivo é entregar um aplicativo chamado **Eleva Remote Desk**, desenvolvido a partir do código open source do RustDesk, conectado exclusivamente à infraestrutura da Eleva e visualmente integrado ao Eleva Remote.

O primeiro release não precisa reinventar a tecnologia de acesso remoto.

A prioridade é:

> pegar uma base madura, torná-la um cliente Eleva bem mantido, seguro, atualizável, fácil de instalar e pronto para futuramente conversar com toda a plataforma Eleva Remote.

A arquitetura deve evitar acoplar desnecessariamente funcionalidades proprietárias ao fork.

O **Desk cuida da sessão remota**.

O **Eleva Remote cuida do produto**.

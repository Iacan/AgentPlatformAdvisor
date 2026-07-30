# Segurança

## Como reportar uma vulnerabilidade

**Por favor, não reporte vulnerabilidades de segurança por meio de issues públicas do GitHub.**

Use o canal privado de relato do próprio GitHub, na aba **Security** deste repositório, em
[Report a vulnerability](https://github.com/Iacan/AgentPlatformAdvisor/security/advisories/new).
Isso mantém o relato privado até que exista uma correção.

Inclua no relato, na medida do possível:

- o tipo de problema e o arquivo ou trecho de código envolvido;
- os passos para reproduzir;
- o impacto que você acredita que a falha tenha.

## Escopo

Este repositório é uma aplicação web estática, sem backend e sem armazenamento de dados
do usuário no servidor: o `index.html` carrega o `assets/apa.js`, que busca o `apa.yaml`
e renderiza tudo no navegador. As respostas ficam apenas no `sessionStorage` do próprio
navegador e nos parâmetros do link compartilhado.

Vulnerabilidades nos produtos Microsoft, Databricks ou em qualquer outro serviço citado
no conteúdo do advisor estão fora do escopo deste repositório e devem ser reportadas ao
fornecedor correspondente. No caso da Microsoft, pelo
[https://aka.ms/SECURITY.md](https://aka.ms/SECURITY.md).

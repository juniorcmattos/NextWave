# Guia de Instalação em ARM64 (Linux/Docker/Apple Silicon)

Este guia detalha os passos necessários para instalar e rodar o **NextWave CRM** em arquiteturas ARM64, com foco na configuração correta do Prisma.

## 1. Requisitos de Sistema
- **Node.js**: v18.x ou v20.x (Recomendado)
- **Git**: Para clonar o projeto
- **SQLite**: (Embutido no projeto)

## 2. Preparação do Prisma para ARM64
O Prisma utiliza motores nativos (Query Engines). Para garantir que ele funcione em ARM64, o arquivo `prisma/schema.prisma` deve estar configurado assim:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x", "linux-arm64-openssl-3.0.x"]
}
```

## 3. Passo a Passo de Instalação

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/DidoNael/NextWave.git
cd NextWave
```

### Passo 2: Instalar Dependências
No ARM64, o npm irá baixar os binários corretos automaticamente se o `schema.prisma` estiver configurado como no Passo 2.
```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="gerar-uma-chave-aleatoria-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### Passo 4: Sincronizar Banco de Dados (Prisma)
Este é o passo crítico onde o Prisma gera o cliente específico para sua arquitetura:
```bash
# Sincroniza o esquema com o arquivo SQLite
npx prisma db push

# Gera o Prisma Client para ARM64
npx prisma generate
```

### Passo 5: Iniciar o Sistema
```bash
# Para desenvolvimento
npm run dev

# Para produção
npm run build
npm start
```

## 4. Solução de Problemas (ARM64)

- **Erro de motor do Prisma (Engine not found)**: Se você encontrar erros dizendo que o binário do Prisma não foi encontrado, execute `npx prisma generate` novamente. Isso forçará o download do motor correto para o seu hardware.
- **Docker**: Se for criar uma imagem Docker, use `node:20-alpine` ou `node:20-slim`, que possuem excelente suporte para ARM64.

---
*Documentação gerada para a versão 1.1.0*

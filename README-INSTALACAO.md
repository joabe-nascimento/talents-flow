# TalentFlow - Guia de Instalação e Execução

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** (opcional)

## 🚀 Como Executar o Projeto

### Opção 1: Usando Scripts Automáticos (Recomendado)

#### Windows - Arquivos .bat

1. **Iniciar tudo de uma vez:**
   - Dê duplo clique em `start-all.bat`
   - Isso abrirá dois terminais: um para o backend e outro para o frontend

2. **Iniciar apenas o Frontend:**
   - Dê duplo clique em `start-frontend.bat`
   - Acesse: http://localhost:4200

3. **Iniciar apenas o Backend:**
   - Dê duplo clique em `start-backend.bat`
   - API: http://localhost:8085/api
   - Swagger: http://localhost:8085/api/swagger-ui.html

#### Windows - Scripts PowerShell

Se os arquivos .bat não funcionarem, use os scripts PowerShell:

1. Abra o PowerShell no diretório do projeto
2. Execute:
   ```powershell
   # Iniciar tudo
   .\start-all.ps1
   
   # OU iniciar separadamente:
   .\start-frontend.ps1  # Em um terminal
   .\start-backend.ps1   # Em outro terminal
   ```

### Opção 2: Execução Manual

#### 1. Instalar Dependências do Frontend

```bash
cd frontend
npm install
```

#### 2. Iniciar o Backend com Docker

Volte para a raiz do projeto e execute:

```bash
# Iniciar Backend + PostgreSQL
docker-compose up --build backend postgres

# OU apenas o banco de dados (se quiser rodar o backend na IDE)
docker-compose up postgres
```

#### 3. Iniciar o Frontend

Em outro terminal:

```bash
cd frontend
npm start
```

### Opção 3: Usando Docker Compose (Produção)

Para executar tudo com Docker (frontend, backend e banco):

```bash
docker-compose up --build
```

Acesse:
- Frontend: http://localhost:80
- Backend: http://localhost:8085/api

## 🔧 Configurações

### Backend

O backend possui dois perfis:

1. **Desenvolvimento (dev)** - Padrão
   - Usa banco H2 em memória
   - Não precisa do Docker
   - Console H2: http://localhost:8080/api/h2-console

2. **Produção (prod)**
   - Usa PostgreSQL
   - Requer Docker Compose

### Frontend

O frontend está configurado para se conectar ao backend em:
- Desenvolvimento: `http://localhost:8080/api`
- Produção: `http://localhost:8085/api`

## 📦 Estrutura do Projeto

```
talents-flow/
├── backend/              # API Spring Boot
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/             # Aplicação Angular
│   ├── src/
│   ├── package.json
│   └── angular.json
├── docker-compose.yml    # Orquestração dos serviços
├── start-all.bat         # Script para iniciar tudo (Windows)
├── start-frontend.bat    # Script para iniciar frontend (Windows)
├── start-backend.bat     # Script para iniciar backend (Windows)
├── start-all.ps1         # Script PowerShell para iniciar tudo
├── start-frontend.ps1    # Script PowerShell para frontend
└── start-backend.ps1     # Script PowerShell para backend
```

## 🌐 URLs Importantes

### Desenvolvimento

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **H2 Console**: http://localhost:8080/api/h2-console
  - JDBC URL: `jdbc:h2:mem:talentflow`
  - Username: `sa`
  - Password: (vazio)

### Produção (Docker)

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8085/api
- **Swagger UI**: http://localhost:8085/api/swagger-ui.html
- **PostgreSQL**: localhost:5434
  - Database: `talentflow`
  - Username: `postgres`
  - Password: `postgres`

## 👤 Usuários Padrão

O sistema cria automaticamente usuários de teste:

1. **Admin**
   - Email: `admin@talentflow.com`
   - Senha: `admin123`

2. **RH**
   - Email: `rh@talentflow.com`
   - Senha: `rh123`

3. **Manager**
   - Email: `manager@talentflow.com`
   - Senha: `manager123`

## 🐛 Solução de Problemas

### Node.js não encontrado

Se ao executar os scripts aparecer "Node.js não encontrado":

1. Instale o Node.js: https://nodejs.org/
2. **Reinicie o Cursor/VS Code** (importante!)
3. Verifique no terminal: `node --version`

### Docker não encontrado

1. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Inicie o Docker Desktop
3. Verifique no terminal: `docker --version`

### Porta já em uso

Se alguma porta estiver em uso:

**Frontend (4200):**
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

**Backend (8080 ou 8085):**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Erro de codificação no PowerShell

Se houver problemas com caracteres especiais:

1. Use os arquivos `.bat` em vez dos `.ps1`
2. OU execute diretamente no terminal do Cursor:
   ```bash
   cd frontend
   npm start
   ```

### Docker Compose não encontra o arquivo

Certifique-se de estar no diretório raiz do projeto:

```bash
# Verificar se está no diretório correto
ls docker-compose.yml

# Se não estiver, navegue para o diretório correto
cd "C:\Users\joabe\OneDrive\Área de Trabalho\novos-apps\talents-flow"
```

## 📝 Comandos Úteis

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test
```

### Backend

```bash
cd backend

# Com Maven (se instalado)
mvn spring-boot:run

# Com Docker
docker-compose up backend

# Build
mvn clean package
```

### Docker

```bash
# Iniciar todos os serviços
docker-compose up

# Iniciar em background
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up --build

# Limpar tudo
docker-compose down -v
```

## 🎯 Próximos Passos

1. Acesse o frontend em http://localhost:4200
2. Faça login com um dos usuários padrão
3. Explore as funcionalidades do sistema
4. Acesse o Swagger para testar a API: http://localhost:8080/api/swagger-ui.html

## 📧 Suporte

Se encontrar problemas, verifique:
1. Se todas as dependências estão instaladas
2. Se as portas não estão em uso
3. Se o Docker Desktop está rodando (para backend em produção)
4. Os logs no terminal para mensagens de erro específicas






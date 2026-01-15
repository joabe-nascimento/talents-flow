# 🎯 TalentFlow

Sistema completo de **Gestão de Talentos e RH** desenvolvido com as tecnologias mais demandadas do mercado.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=flat-square&logo=spring)
![Angular](https://img.shields.io/badge/Angular-17-red?style=flat-square&logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)

## 📋 Sobre o Projeto

TalentFlow é uma plataforma completa para gestão de recursos humanos, incluindo:

- 👥 **Gestão de Funcionários** - Cadastro, edição e acompanhamento de colaboradores
- 🏢 **Departamentos** - Organização da estrutura da empresa
- 💼 **Vagas** - Publicação e gerenciamento de oportunidades
- 📋 **Candidatos** - Acompanhamento do processo seletivo
- 📊 **Dashboard** - Visão geral com métricas importantes
- 🔐 **Autenticação JWT** - Sistema seguro com controle de acesso por perfis

## 🛠 Stack Tecnológica

### Backend
- **Java 17** - Linguagem principal
- **Spring Boot 3.2** - Framework web
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **JWT** - Tokens de autenticação
- **PostgreSQL** - Banco de dados (produção)
- **H2** - Banco de dados (desenvolvimento)
- **Swagger/OpenAPI** - Documentação da API

### Frontend
- **Angular 17** - Framework frontend
- **TypeScript** - Linguagem tipada
- **SCSS** - Estilização
- **Standalone Components** - Arquitetura moderna
- **Signals** - Gerenciamento de estado reativo

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Servidor web (produção)

## 🚀 Como Executar

### Pré-requisitos
- Java 17+
- Node.js 18+
- Maven 3.8+
- Docker (opcional)

### Desenvolvimento Local

#### Backend
```bash
cd backend
mvn spring-boot:run
```
O backend estará disponível em: http://localhost:8080/api

#### Frontend
```bash
cd frontend
npm install
npm start
```
O frontend estará disponível em: http://localhost:4200

### Com Docker
```bash
docker-compose up -d
```
- Frontend: http://localhost
- Backend: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html

## 📚 Documentação da API

Após iniciar o backend, acesse:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/api-docs

## 🔐 Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@talentflow.com | admin123 |
| RH | maria.silva@talentflow.com | hr123456 |

## 📁 Estrutura do Projeto

```
talents-flow/
├── backend/                 # API Spring Boot
│   ├── src/main/java/
│   │   └── com/talentflow/api/
│   │       ├── config/      # Configurações
│   │       ├── controller/  # Endpoints REST
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── entity/      # Entidades JPA
│   │       ├── exception/   # Tratamento de erros
│   │       ├── repository/  # Repositórios JPA
│   │       ├── security/    # JWT e autenticação
│   │       └── service/     # Regras de negócio
│   └── Dockerfile
│
├── frontend/                # SPA Angular
│   ├── src/app/
│   │   ├── core/           # Services, Guards, Models
│   │   ├── features/       # Módulos de funcionalidades
│   │   ├── layout/         # Componentes de layout
│   │   └── shared/         # Componentes compartilhados
│   └── Dockerfile
│
├── docker-compose.yml       # Orquestração Docker
└── README.md
```

## 🎯 Funcionalidades

### Dashboard
- Visão geral com métricas
- Total de funcionários, departamentos, vagas e candidatos
- Ações rápidas

### Funcionários
- CRUD completo
- Filtro por departamento
- Status (Ativo, Afastado, Desligado)
- Perfis de acesso (Admin, RH, Gerente, Funcionário)

### Departamentos
- Cadastro de departamentos
- Atribuição de gerente
- Contagem de funcionários

### Vagas
- Publicação de vagas
- Status (Aberta, Fechada, Em Espera, Preenchida)
- Tipos (CLT, PJ, Estágio, Remoto)
- Faixa salarial

### Candidatos
- Cadastro de candidatos
- Associação à vaga
- Pipeline de status (Aplicado → Triagem → Entrevista → Contratado)
- Link do LinkedIn

## 🔒 Controle de Acesso

| Recurso | Admin | RH | Gerente | Funcionário |
|---------|:-----:|:--:|:-------:|:-----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Ver Funcionários | ✅ | ✅ | ✅ | ✅ |
| Editar Funcionários | ✅ | ✅ | ❌ | ❌ |
| Gerenciar Vagas | ✅ | ✅ | ❌ | ❌ |
| Gerenciar Candidatos | ✅ | ✅ | ✅* | ❌ |

*Gerentes podem atualizar status de candidatos

## 🧪 Endpoints Principais

```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Registro

GET    /api/employees           # Listar funcionários
POST   /api/employees           # Criar funcionário
PUT    /api/employees/:id       # Atualizar funcionário
DELETE /api/employees/:id       # Desativar funcionário

GET    /api/departments         # Listar departamentos
POST   /api/departments         # Criar departamento
PUT    /api/departments/:id     # Atualizar departamento
DELETE /api/departments/:id     # Excluir departamento

GET    /api/jobs                # Listar vagas
GET    /api/jobs/open           # Vagas abertas
POST   /api/jobs                # Criar vaga
PUT    /api/jobs/:id            # Atualizar vaga

GET    /api/candidates          # Listar candidatos
POST   /api/candidates          # Criar candidato
PATCH  /api/candidates/:id/status # Atualizar status

GET    /api/dashboard           # Dados do dashboard
```

## 📈 Próximos Passos

- [ ] Testes unitários e de integração
- [ ] CI/CD com GitHub Actions
- [ ] Deploy na nuvem (AWS/Azure/GCP)
- [ ] Relatórios em PDF
- [ ] Notificações por email
- [ ] Avaliação de desempenho

## 📄 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido com ❤️ para demonstrar habilidades em **Java + Spring Boot + Angular**



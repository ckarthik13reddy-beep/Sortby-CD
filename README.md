# DataAI - AI-Powered Data Analysis Platform

## 🚧 Backend Integration In Progress

**Current Status**: The UI is fully built with all features complete. Backend integration is actively being implemented.

**See `BACKEND_INTEGRATION.md` for complete integration guide and progress tracking.**

---

## Overview

DataAI is a comprehensive, full-stack AI-powered data analysis platform similar to Julius AI. It enables users to chat with data using natural language, create Jupyter-style notebooks, connect to multiple data sources, and generate customizable visualizations.

## ✅ Features Status

### Completed (UI + Backend)
- ✅ **Natural Language Chat**: Real-time streaming chat with @assistant-ui/react
- ✅ **Authentication**: NextAuth + AWS Cognito with Google federated login
- ✅ **Backend API Layer**: Complete API client with 30+ functions

### In Progress (UI Complete, Backend Integration Pending)
- 🚧 **AI-Powered Dashboards**: UI complete, needs API integration
- 🚧 **Data Source Connections**: UI complete, needs API integration
- 🔜 **Browse Data**: Backend has feature, needs to copy to UI

### UI-Only (Backend APIs Pending)
- 📋 **Jupyter-Style Notebooks**: Full UI, awaiting backend APIs
- 📋 **File Management**: Drag-drop upload, awaiting backend APIs
- 📋 **Team Collaboration**: Complete team workspace UI
- 📋 **Semantic Layer**: AI customization settings
- 📋 **Pre-built AI Agents**: Agent marketplace UI

## 🛠️ Technology Stack

### Frontend
- **Next.js 14.2.18** with App Router and TypeScript
- **Tailwind CSS** with shadcn/ui components
- **@assistant-ui/react** for AI chat streaming
- **NextAuth.js** with AWS Cognito authentication
- **Zustand** for state management
- **Recharts** for visualizations
- **@tanstack/react-query** for data fetching

### Backend (Integration Target)
- **Next.js 15.5.6** API server
- **Server-Sent Events (SSE)** for streaming
- **PostgreSQL** database
- **AWS Cognito** for authentication
- **RESTful APIs** at `NEXT_PUBLIC_API_URL`

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** (v14 or higher)
- **Redis** (optional, for caching)
- **Docker** (optional, for Python code execution)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Julius Replica"
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dataai?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# Redis
REDIS_URL="redis://localhost:6379"
```

### 4. Set Up the Database

Create your PostgreSQL database and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/Julius Replica
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── chat/                # Chat interface pages
│   ├── notebooks/           # Notebook editor pages
│   ├── files/               # File management pages
│   ├── settings/            # Settings pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── chat/                # Chat-specific components
│   ├── notebooks/           # Notebook components
│   └── layout/              # Layout components
├── lib/                     # Utility libraries
│   ├── db/                  # Database utilities
│   ├── ai/                  # AI integration
│   └── utils.ts             # Helper functions
├── services/                # Business logic services
├── prisma/                  # Prisma schema and migrations
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── uploads/                 # File uploads (local storage)
```

## 🗄️ Database Schema

The application uses the following main tables:

- **User**: User accounts with tiers (FREE, PRO, BUSINESS, ENTERPRISE)
- **Conversation**: Chat conversations with messages
- **Message**: Individual chat messages
- **Notebook**: Jupyter-style notebooks with cells
- **File**: Uploaded files and metadata
- **DataConnector**: Database and cloud storage connections
- **CustomAgent**: User-created AI agents
- **Team**: Team workspaces
- **TeamMember**: Team membership and roles

## 🎨 UI Components

DataAI uses shadcn/ui components for a consistent design system:

- **Colors**: Primary Blue (#3B82F6), with dark/light mode support
- **Typography**: Inter font family
- **Spacing**: 4px base unit
- **Components**: Button, Input, Card, Dialog, Dropdown, Select, etc.

## 🔧 Configuration

### Model Selection

Configure AI models in your settings:
- GPT-4 (default)
- GPT-3.5 Turbo
- Claude (coming soon)

### Feature Toggles

Enable/disable features:
- Learn from Feedback
- Web Search
- Autorun Code
- Advanced Reasoning
- Extended Memory

### Chart Themes

Available visualization themes:
- Julius (default)
- Scientific
- Business
- Dark
- Interactive

## 📦 Development Workflow

### Phase 1: Foundation ✅
- Project setup with Next.js, TypeScript, Tailwind CSS
- Prisma database schema
- Authentication with NextAuth.js
- Main layout and navigation

### Phase 2: Chat Interface (Next)
- Chat UI components
- OpenAI integration
- Message streaming
- Code execution

### Phase 3: File Management
- File upload and storage
- File list and preview
- Data profiling

### Phase 4: Notebooks
- Notebook editor
- Cell execution
- Scheduling system

### Phase 5: Data Connectors
- Connector configuration
- Query interface
- Multiple database support

### Phase 6-10: Advanced Features
- Visualizations
- Custom agents
- Team collaboration
- Settings panel
- Advanced features

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker

```bash
# Build the Docker image
docker build -t dataai .

# Run the container
docker run -p 3000:3000 dataai
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signout` - Sign out

### Chat Endpoints

- `GET /api/conversations` - List user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations/:id/messages` - Send message
- `DELETE /api/conversations/:id` - Delete conversation

### File Endpoints

- `GET /api/files` - List user files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete file

### Notebook Endpoints

- `GET /api/notebooks` - List notebooks
- `POST /api/notebooks` - Create notebook
- `GET /api/notebooks/:id` - Get notebook
- `PUT /api/notebooks/:id` - Update notebook
- `POST /api/notebooks/:id/run` - Run notebook

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Julius AI
- Built with Next.js, Prisma, and OpenAI
- UI components from shadcn/ui

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using Next.js 14, TypeScript, and AI**

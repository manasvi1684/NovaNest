# NovaNest - Modular Productivity OS 🚀

A full-stack, multi-tenant, modular SaaS productivity platform designed as a personal OS for creators, developers, and thinkers. Built with the MERN stack and featuring real-time collaboration, AI integration, and enterprise-grade architecture.

![NovaNest](https://img.shields.io/badge/NovaNest-Productivity%20OS-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.20.8-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-blue)
![Tests](https://img.shields.io/badge/Tests-Jest%20%7C%20RTL-green)

## 🌟 Features

### 📝 **ThinkTrek** - Intelligent Journaling
- Rich markdown editor with syntax highlighting
- Tagging and backlinking system
- Visual knowledge mapping
- Pinned notes and folder organization
- Soft delete and version history
- AI-powered note suggestions

### 🐛 **BugTrace** - Personal Dev Issue Tracker
- Project-based issue management
- Kanban-style workflow
- Priority and status tracking
- Git commit linking
- Sprint overview and filters
- Real-time collaboration

### 🏆 **Achievify** - Gamified Goal Tracking
- XP system with levels and streaks
- Milestone tracking and rewards
- Achievement badges
- Progress visualization
- Daily challenges
- Confetti animations

### 👥 **TeamSync** - Team Collaboration
- Multi-tenant team management
- Role-based access control (Owner/Admin/Member)
- Shared goals and milestones
- Real-time team analytics
- Email invitations
- Team productivity insights

### 📊 **Analytics Dashboard**
- XP progression charts
- Goal completion statistics
- Streak heatmaps
- Module usage breakdown
- Interactive visualizations
- Export capabilities

### ⚡ **Real-time Features**
- **Command Palette** (⌘K) - Quick navigation and creation
- **Live Notifications** - Socket.io powered real-time updates
- **Collaborative Editing** - Real-time team collaboration
- **Live Activity Feed** - Team and personal activity tracking

### 🔧 **Enterprise Architecture**
- **Modular Microservices** - Scalable service architecture
- **Multi-tenancy** - Secure tenant isolation
- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Granular permissions
- **API Gateway** - Centralized API management
- **Real-time Communication** - WebSocket integration

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **Chart.js** for analytics
- **React Testing Library** for testing

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.io** for real-time features
- **JWT** for authentication
- **Passport.js** for OAuth
- **Jest** for testing

### DevOps
- **GitHub Actions** for CI/CD
- **Vercel** for frontend deployment
- **Render/Railway** for backend deployment
- **Environment Management** with secrets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/novanest.git
cd novanest
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. **Environment Setup**
```bash
# Backend (.env)
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend (.env)
cd ../client
cp .env.example .env
# Edit .env with your API URL
```

4. **Start the application**
```bash
# Start backend (from server directory)
npm start

# Start frontend (from client directory)
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
cd client
npm test

# Backend tests
cd server
npm test

# E2E tests
cd client
npm run test:e2e
```

### Test Coverage
- Unit tests for all components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Coverage reports included

## 📦 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically via GitHub Actions

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Multi-tenant Data Isolation**
- **Input Validation** and sanitization
- **CORS Configuration**
- **Rate Limiting**
- **Environment Variable Management**

## 🎯 Key Features

### Command Palette (⌘K)
- Quick navigation between modules
- Instant creation of notes, goals, projects
- Search across all features
- Keyboard shortcuts for power users

### Real-time Notifications
- Live updates for team activities
- Goal completion celebrations
- Issue assignments and updates
- Team invitations and announcements

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Progressive Web App ready

### Offline Support
- Service worker caching
- Local data persistence
- Sync when online
- Offline-first architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Inspired by modern productivity tools like Notion, Linear, and Obsidian
- Special thanks to the open-source community

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/novanest/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/novanest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/novanest/discussions)

---

**NovaNest** - Your modular productivity OS for the modern creator 🚀
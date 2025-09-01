# Permit Management System

A comprehensive React-based permit management system for tracking and managing permit packages across all 67 Florida counties. Built with modern web technologies and designed for self-hosting with optional internet exposure.

## Features

### Must Have (Core Features)
- ✅ **Permit Package Management**: Create, manage, and track permit package progress
- ✅ **Customer & Contractor Management**: Store detailed customer and contractor information
- ✅ **PDF Template Support**: Upload PDF templates with form fields and autofill them
- ✅ **Multiple Packages per Customer**: Support multiple permit packages per customer
- ✅ **Self-Hostable**: Designed for local PC/server deployment with LAN accessibility
- ✅ **Authentication**: User authentication and role-based access control
- ✅ **County Checklists**: Comprehensive checklists for all 67 Florida counties with admin editing capabilities

### Should Have (Important Features)
- ✅ **Search & Filter**: Search and filter permit packages
- ✅ **Document Management**: Attach documents/photos to packages
- ✅ **Multi-User Roles**: Support for Admin and User roles
- ✅ **PDF Operations**: Download and print filled PDFs

### Could Have (Future Enhancements)
- 📋 **Email Notifications**: Status update notifications
- 📋 **Dashboard/Calendar**: Deadline tracking and calendar view
- 📋 **Mobile-Friendly UI**: Responsive design for mobile devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for server state management
- **React Hook Form** with Zod for form validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **PDF.js** for PDF rendering and manipulation
- **Socket.IO Client** for real-time features
- **React Hot Toast** for notifications

### Backend (Planned)
- **NestJS** with Fastify adapter
- **Prisma ORM** for database management
- **PostgreSQL** for data storage
- **MinIO** for S3-compatible file storage
- **Socket.IO** for WebSocket support
- **JWT** for authentication
- **RBAC** for role-based access control

## Project Structure

```
permitmanagementsystem/
├── packages/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── contexts/       # React contexts (Auth, Socket)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utility libraries (API, etc.)
│   │   │   ├── pages/          # Page components
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   ├── App.tsx         # Main application component
│   │   │   └── main.tsx        # Application entry point
│   │   ├── public/             # Static assets
│   │   ├── package.json        # Frontend dependencies
│   │   ├── vite.config.ts      # Vite configuration
│   │   ├── tailwind.config.js  # Tailwind CSS configuration
│   │   └── tsconfig.json       # TypeScript configuration
│   └── api/                    # Backend API (planned)
├── docker-compose.yml          # Docker deployment configuration
└── README.md                   # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Frontend Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PermitManagementSystem
   ```

2. **Install dependencies**
   ```bash
   cd packages/web
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Key Components

### Authentication System
- JWT-based authentication
- Role-based access control (Admin/User)
- Protected routes and components
- Automatic token refresh

### Permit Package Management
- Create and edit permit packages
- Track package status and progress
- Associate packages with customers and contractors
- County-specific checklist management

### Document Management
- Upload and store documents
- PDF template support with form field mapping
- Document categorization and tagging
- Presigned URL for secure file access

### Real-time Features
- WebSocket integration for live updates
- Real-time checklist item toggling
- Status change notifications
- Presence indicators

## API Integration

The frontend is designed to work with a RESTful API that provides:

- **Authentication**: Login, logout, user management
- **CRUD Operations**: Customers, contractors, packages, documents
- **File Management**: Upload, download, presigned URLs
- **PDF Operations**: Template management, form field mapping
- **Real-time**: WebSocket events for live updates

## Deployment

### Development
```bash
cd packages/web
npm run dev
```

### Production Build
```bash
cd packages/web
npm run build
```

### Docker Deployment (Planned)
```bash
docker-compose up -d
```

## Configuration

### Environment Variables
Create a `.env` file in the `packages/web` directory:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_NAME=Permit Management System
```

### Tailwind CSS
The project uses Tailwind CSS with a custom configuration that includes:
- Custom color palette
- Responsive design utilities
- Component-specific styles
- Dark mode support (planned)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API specification

## Roadmap

### Phase 1: Core Frontend ✅
- [x] Authentication system
- [x] User management
- [x] Customer and contractor management
- [x] Permit package creation and management
- [x] Document upload and management
- [x] PDF viewer and form filling
- [x] County checklist management
- [x] Real-time updates

### Phase 2: Backend Development 📋
- [ ] NestJS API development
- [ ] Database schema implementation
- [ ] File storage integration
- [ ] Authentication and authorization
- [ ] WebSocket server implementation

### Phase 3: Advanced Features 📋
- [ ] Email notifications
- [ ] Dashboard analytics
- [ ] Mobile-responsive design
- [ ] Advanced PDF operations
- [ ] Reporting and exports

### Phase 4: Deployment & Production 📋
- [ ] Docker containerization
- [ ] Production deployment guides
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and logging

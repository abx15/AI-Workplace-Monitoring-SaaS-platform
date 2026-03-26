# AI Workplace Monitor - Frontend

A modern, responsive Next.js 15 application for AI-powered workplace monitoring with real-time alerts, analytics, and user management.

## 🚀 Features

- **Real-time Monitoring**: Live camera feeds with AI detection overlays
- **Alert Management**: Real-time alerts with filtering and bulk actions
- **Analytics Dashboard**: Comprehensive insights with interactive charts
- **User Management**: Role-based access control (Admin/Operator)
- **Subscription System**: Tiered pricing with Razorpay integration
- **Responsive Design**: Mobile-first dark theme with glassmorphism

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with persist
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Real-time**: Socket.IO Client

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
frontend/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin-specific pages
│   ├── operator/          # Operator-specific pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── cards/             # UI cards
│   ├── charts/            # Chart components
│   ├── navbar/            # Navigation
│   ├── sidebar/           # Sidebar navigation
│   └── monitoring/        # Live monitoring components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🔐 Authentication

The application uses JWT-based authentication with role-based access control:

- **Admin**: Full access to all features
- **Operator**: Limited to assigned cameras and alerts

## 📊 Pages

### Admin Pages
- `/admin/dashboard` - Overview with statistics
- `/admin/cameras` - Live monitoring
- `/admin/alerts` - Alert management
- `/admin/operators` - Operator management
- `/admin/employees` - Employee management
- `/admin/analytics` - Advanced analytics
- `/admin/subscription` - Subscription plans
- `/admin/settings` - System settings

### Operator Pages
- `/operator/dashboard` - Operator overview
- `/operator/cameras` - Assigned cameras
- `/operator/alerts` - Assigned alerts

### Auth Pages
- `/auth/login` - Login page

## 🎨 Design System

The application uses a consistent dark theme with:

- **Primary Color**: #2563EB (Blue)
- **Background**: #0F172A (Dark Navy)
- **Card Background**: #1E293B
- **Text Primary**: #F1F5F9
- **Text Muted**: #94A3B8
- **Border**: #334155

## 🔄 State Management

Uses Zustand with persist middleware for:
- Authentication state
- Alert management
- Camera management

## 📡 Real-time Features

Socket.IO integration for:
- Live alerts
- Camera status updates
- Detection events

## 🎯 Key Features

### Live Monitoring
- Real-time camera feeds
- AI detection overlays
- Face recognition bounding boxes
- Status indicators

### Alert System
- Real-time alert notifications
- Alert filtering and search
- Bulk actions (resolve/ignore)
- Alert history

### Analytics
- Interactive charts
- Trend analysis
- Hotspot identification
- Export capabilities

### User Management
- Role-based permissions
- Operator assignments
- Employee profiles
- Photo upload

## 🚀 Build & Deploy

1. Build for production:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## 📝 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

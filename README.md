# AI Workplace Monitoring SaaS Platform

A comprehensive AI-powered workplace monitoring solution designed to enhance productivity, ensure compliance, and provide actionable insights for modern organizations.

## 🚀 Features

### Core Monitoring
- **Real-time Activity Tracking**: Monitor employee activities across various applications and platforms
- **Productivity Analytics**: AI-driven insights into work patterns and productivity metrics
- **Screen Capture & Analysis**: Automated screenshot capture with intelligent content analysis
- **Application Usage Tracking**: Monitor time spent on different applications and websites

### AI-Powered Insights
- **Behavioral Pattern Recognition**: Identify productive vs. non-productive work patterns
- **Anomaly Detection**: Flag unusual activities that may require attention
- **Performance Predictions**: ML-based predictions for team and individual performance
- **Automated Reporting**: Generate comprehensive reports with AI recommendations

### Management Dashboard
- **Real-time Analytics**: Live dashboard with key metrics and KPIs
- **Team Management**: Organize and monitor teams and individual employees
- **Custom Reports**: Create and schedule custom reports based on specific needs
- **Alert System**: Configurable alerts for important events or threshold breaches

### Security & Compliance
- **Data Encryption**: End-to-end encryption for all monitoring data
- **GDPR Compliance**: Built-in compliance with data protection regulations
- **Access Control**: Role-based access control for different user types
- **Audit Logs**: Comprehensive audit trail for all monitoring activities

## 🏗️ Architecture

This platform follows a microservices architecture with the following components:

### Frontend (Next.js)
- **Framework**: Next.js 15 with React 19
- **Styling**: TailwindCSS with modern UI components
- **State Management**: Zustand for efficient state handling
- **Charts & Visualization**: Recharts for data visualization
- **Real-time Updates**: Socket.io client for live data

### Backend (Node.js/TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with MongoDB for different data types
- **Authentication**: JWT-based authentication with bcrypt
- **File Storage**: Cloudinary integration for media files
- **Payment**: Razorpay integration for subscription management
- **Real-time Communication**: Socket.io for WebSocket connections

### AI Service (Python)
- **Machine Learning**: Advanced ML models for behavior analysis
- **Computer Vision**: Image and video processing for activity monitoring
- **Natural Language Processing**: Text analysis for communication monitoring
- **Data Processing**: High-performance data processing pipelines

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.9+
- PostgreSQL 13+
- MongoDB 5.0+
- Redis (for caching and session management)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-workplace-monitoring.git
cd ai-workplace-monitoring
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file with the following variables:
```env
DATABASE_URL=your_postgresql_connection_string
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
```

Create `.env` file:
```env
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key
DATABASE_URL=your_database_url
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend**:
```bash
cd backend
npm run dev
```

2. **Start the AI Service**:
```bash
cd ai-service
python main.py
```

3. **Start the Frontend**:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

### Production Deployment

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Monitoring Endpoints
- `GET /api/monitoring/activities` - Get user activities
- `POST /api/monitoring/screenshot` - Upload screenshot
- `GET /api/monitoring/analytics` - Get analytics data
- `GET /api/monitoring/reports` - Generate reports

### Management Endpoints
- `GET /api/management/teams` - Get teams
- `POST /api/management/teams` - Create team
- `GET /api/management/users` - Get users
- `PUT /api/management/users/:id` - Update user

## 🔧 Configuration

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CLOUDINARY_*`: Cloudinary configuration
- `RAZORPAY_*`: Razorpay payment gateway keys

#### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket server URL

#### AI Service
- `OPENAI_API_KEY`: OpenAI API key
- `HUGGINGFACE_API_KEY`: Hugging Face API key

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### AI Service Tests
```bash
cd ai-service
python -m pytest
```

## 📈 Monitoring & Analytics

### Key Metrics Tracked
- **Productivity Score**: AI-calculated productivity metrics
- **Active Time**: Time spent on productive activities
- **Application Usage**: Time spent on different applications
- **Website Visits**: Browsing history and time analysis
- **Communication Patterns**: Email and chat analysis

### Reports Available
- **Daily Reports**: Daily activity summaries
- **Weekly Reports**: Weekly productivity trends
- **Monthly Reports**: Monthly performance analytics
- **Custom Reports**: Tailored reports based on specific metrics

## 🔒 Security Features

- **End-to-end Encryption**: All data encrypted in transit and at rest
- **Role-based Access Control**: Different access levels for different roles
- **Audit Logging**: Complete audit trail of all activities
- **Data Retention Policies**: Configurable data retention and deletion
- **Compliance**: GDPR, CCPA, and other privacy regulation compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@aiworkplacemonitor.com
- Documentation: [docs.aiworkplacemonitor.com](https://docs.aiworkplacemonitor.com)
- Issues: [GitHub Issues](https://github.com/your-username/ai-workplace-monitoring/issues)

## 🗺️ Roadmap

### Version 2.0 (Q2 2024)
- [ ] Advanced AI predictions
- [ ] Mobile app support
- [ ] Enhanced reporting features
- [ ] Integration with more tools

### Version 3.0 (Q4 2024)
- [ ] Custom AI model training
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Enterprise features

---

**⚠️ Important Note**: This platform is designed for legitimate workplace monitoring purposes only. Users must ensure compliance with local laws and regulations regarding employee monitoring and privacy.
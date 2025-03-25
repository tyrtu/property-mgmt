# Property Management System

A modern, feature-rich property management system built with React and Material-UI, designed to streamline property operations, tenant management, and financial tracking.

![Property Management Dashboard](public/dashboard-preview.png)

## 🌟 Features

### Property Management
- Real-time property status tracking
- Unit management and occupancy monitoring
- Property performance metrics
- Document management system

### Tenant Management
- Comprehensive tenant profiles
- Lease agreement management
- Tenant communication logs
- Background check integration

### Financial Management
- Automated rent collection
- Payment tracking and processing
- Financial reporting and analytics
- Budget management tools

### Maintenance System
- Maintenance request tracking
- Priority-based scheduling
- Cost tracking and analysis
- Vendor management

### Reporting & Analytics
- Real-time performance metrics
- Financial reports
- Occupancy analytics
- Market analysis tools

## 🚀 Tech Stack

### Frontend
- React 18
- Material-UI v5
- Vite
- React Router DOM
- Chart.js/Recharts
- FullCalendar

### Backend
- Node.js
- Express.js
- Firebase
- Supabase
- Twilio (SMS notifications)

### Database
- PostgreSQL (via Supabase)
- Firebase Realtime Database

### Authentication
- Firebase Authentication
- JWT
- Role-based access control

### Additional Services
- Email notifications (Nodemailer)
- SMS notifications (Twilio)
- File storage (Firebase Storage)
- Scheduling (node-cron)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/property-management-system.git
cd property-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in your environment variables in the `.env` file.

4. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

The application requires the following environment variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
property-management-system/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API and external services
│   ├── utils/         # Utility functions
│   ├── assets/        # Static assets
│   └── App.jsx        # Main application component
├── public/            # Public assets
├── backend/           # Backend services
├── functions/         # Firebase Cloud Functions
└── supabase/         # Supabase configurations
```

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Data encryption
- Regular security updates

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop browsers
- Tablets
- Mobile devices

## 🌙 Dark Mode

The application features a built-in dark mode that:
- Automatically syncs with system preferences
- Can be manually toggled
- Persists across sessions
- Optimizes readability in low-light conditions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Firebase team for the robust backend services
- All contributors who have helped shape this project

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.

---

Made with ❤️ by [Your Name/Company] 
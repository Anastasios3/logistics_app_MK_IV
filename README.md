# LogiTrack - Logistics Management System

A comprehensive, full-stack logistics management application built with Django for backend, React for frontend, and SQLite for database storage.

## 🚚 Features

- **User Authentication**: Secure login/registration with JWT authentication
- **Dashboard**: Real-time analytics and key performance indicators
- **Order Management**: Create, track, and manage customer orders
- **Inventory Management**: Track stock levels, transfers, and low stock alerts
- **Shipment Tracking**: Monitor shipments, assign drivers and vehicles
- **Customer Management**: Manage customer information and order history
- **Supplier Management**: Track supplier information and purchase orders
- **Reporting**: Generate detailed reports on sales, inventory, and shipments
- **Mobile-Responsive Interface**: Modern UI that works on all devices

## 🛠️ Technology Stack

### Backend
- **Django**: Web framework for rapid development
- **Django REST Framework**: For building RESTful APIs
- **SQLite**: Database for development (can be switched to PostgreSQL for production)
- **JWT Authentication**: Secure user authentication
- **Swagger/OpenAPI**: API documentation

### Frontend
- **React**: Frontend library for building user interfaces
- **Redux Toolkit**: State management
- **Material-UI**: Component library for modern, responsive design
- **Chart.js**: Data visualization
- **Formik & Yup**: Form management and validation
- **Axios**: API requests handling

## 📂 Project Structure

The project follows a clean separation of concerns with frontend and backend codebases:

```
logistics-app/
├── backend/               # Django API backend
│   ├── accounts/          # User authentication
│   ├── orders/            # Order management
│   ├── inventory/         # Inventory management
│   ├── shipments/         # Shipment tracking
│   └── reports/           # Reporting functionality
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       ├── store/         # Redux store
│       ├── context/       # React context
│       ├── hooks/         # Custom hooks
│       └── utils/         # Utility functions
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd logistics-app/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd logistics-app/frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 📱 Application Screenshots

[Here we would add screenshots of key application pages]

## 🔒 Security Features

- JWT authentication with token refresh
- Password hashing
- Permission-based access control
- Input validation
- CSRF protection

## 🔄 API Endpoints

The backend provides a comprehensive RESTful API:

- `/api/auth/` - Authentication endpoints
- `/api/orders/` - Order management
- `/api/products/` - Product catalog
- `/api/inventory/` - Inventory management
- `/api/shipments/` - Shipment tracking
- `/api/customers/` - Customer information
- `/api/suppliers/` - Supplier information
- `/api/reports/` - Reporting endpoints
- `/api/dashboard/` - Dashboard analytics

## 🚀 Starting the Application

After you've completed the initial setup, you can start the application in the future with these simplified steps:

### Start the Backend

```bash
# Navigate to backend directory
cd logistics-app/backend

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the Django server
python manage.py runserver
```

### Start the Frontend

```bash
# In a new terminal, navigate to frontend directory
cd logistics-app/frontend

# Start the React development server
npm start
```

### Access the Application

- Backend API: http://localhost:8000/api/
- Admin Dashboard: http://localhost:8000/admin/
- Frontend App: http://localhost:3000/

### Development Workflow

1. Log in to the application using the credentials created during setup
2. Make changes to backend Django code and they will auto-reload
3. Frontend React changes will automatically hot-reload in the browser
4. For database changes, run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

### Production Deployment

For production deployment:

1. Set `DEBUG=False` in Django settings
2. Build the React frontend: `npm run build`
3. Configure a production web server like Nginx
4. Set up a production database (PostgreSQL recommended)
5. Use Gunicorn or uWSGI to serve the Django application

## 📋 Future Enhancements

- **Advanced Analytics**: Machine learning for demand forecasting
- **Route Optimization**: Calculate optimal delivery routes
- **Mobile App**: Native mobile application for drivers
- **Barcode/QR Integration**: Scan products using device camera
- **Payment Gateway**: Integrate with payment processors
- **Multicurrency Support**: Handle international transactions

## 📄 License

This project is licensed under the MIT License.

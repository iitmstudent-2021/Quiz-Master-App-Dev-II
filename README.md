# Quiz Master V2 - Modern Application Development II

## 📋 Project Overview

Quiz Master V2 is a comprehensive multi-user quiz management application designed as an exam preparation platform for multiple courses. The application serves as a learning management system with role-based access control, featuring an Administrator (Quiz Master) who manages content and Users who attempt quizzes.

## 👥 Student Details

**Project**: Modern Application Development II - Quiz Master V2  
**Course**: IIT Madras BS in Data Science & Applications  
**Academic Year**: 2024-2025  

## 🎯 Problem Statement Approach

This application addresses the need for a scalable, multi-user quiz platform that enables:
- Centralized quiz management by administrators
- Self-paced learning for users across multiple subjects
- Performance tracking and analytics
- Automated notifications and reporting
- Asynchronous task processing for heavy operations

## 🏗️ Technology Stack & Frameworks

### **Mandatory Frameworks Used:**
- **Backend**: Flask (Python web framework)
- **Frontend**: Vue.js 2.7 with Vue Router
- **Database**: SQLite (lmsv2.sqlite3)
- **Styling**: Bootstrap 5.3
- **Caching**: Redis Cache
- **Background Jobs**: Celery with Redis broker
- **Templates**: Jinja2 (entry point only)

### **Additional Libraries:**
- **Authentication**: Flask-Security-Too
- **API Development**: Flask-RESTful
- **Database ORM**: SQLAlchemy
- **Email**: Flask-Mail with SMTP
- **Charts**: Chart.js
- **Task Queue**: Celery with Redis
- **HTTP Requests**: Requests library

## 🗄️ Database Schema & ER Diagram

### **Core Entities:**

```
User (Flask-Security)
├── id (PK)
├── email (unique)
├── username (unique)
├── password (hashed)
├── roles (Many-to-Many with Role)
└── active (boolean)

User_Info (Extended Profile)
├── id (PK)
├── email (FK to User)
├── full_name
├── qualification
├── date_of_birth
└── scores (One-to-Many with Score)

Subject
├── id (PK)
├── name
├── description
└── chapters (One-to-Many with Chapter)

Chapter
├── id (PK)
├── name
├── description
├── no_of_questions
├── subject_id (FK)
└── quizzes (One-to-Many with Quiz)

Quiz
├── id (PK)
├── name
├── chapter_id (FK)
├── quiz_date (DateTime)
├── duration_time (Interval)
├── questions (One-to-Many with Question)
└── scores (One-to-Many with Score)

Question
├── id (PK)
├── quiz_id (FK)
├── name
├── question_statement
├── option_1, option_2, option_3, option_4
├── correct_option (1-4)
└── marks (default: 1)

Score
├── id (PK)
├── user_id (FK)
├── quiz_id (FK)
├── total_score
└── time_stamp_of_attempt
```

### **Relationships:**
- **User ↔ Role**: Many-to-Many (Flask-Security)
- **Subject → Chapter**: One-to-Many
- **Chapter → Quiz**: One-to-Many  
- **Quiz → Question**: One-to-Many
- **User → Score**: One-to-Many
- **Quiz → Score**: One-to-Many

## 🛠️ API Resource Endpoints

### **Authentication Endpoints:**
```
POST   /api/login              # User/Admin login
POST   /api/register           # User registration
GET    /api/home              # User profile info
GET    /api/admin             # Admin dashboard access
```

### **RESTful Resource Endpoints:**
```
# Subject Management
GET    /api/subjects                    # List all subjects
POST   /api/subjects                    # Create new subject (Admin)
GET    /api/subjects/<id>              # Get specific subject
PUT    /api/subjects/<id>              # Update subject (Admin)
DELETE /api/subjects/<id>              # Delete subject (Admin)

# Chapter Management  
GET    /api/chapters                    # List all chapters
POST   /api/chapters                    # Create new chapter (Admin)
GET    /api/chapters/<id>              # Get specific chapter
PUT    /api/chapters/<id>              # Update chapter (Admin)
DELETE /api/chapters/<id>              # Delete chapter (Admin)

# Quiz Management
GET    /api/quizzes                     # List all quizzes
POST   /api/quizzes                     # Create new quiz (Admin)
GET    /api/quizzes/<id>               # Get specific quiz
PUT    /api/quizzes/<id>               # Update quiz (Admin)
DELETE /api/quizzes/<id>               # Delete quiz (Admin)

# Question Management
GET    /api/questions                   # List all questions
POST   /api/questions                   # Create new question (Admin)
GET    /api/questions/<id>             # Get specific question
PUT    /api/questions/<id>             # Update question (Admin)
DELETE /api/questions/<id>             # Delete question (Admin)

# Quiz Attempts
POST   /api/quizzes/<id>/attempt       # Submit quiz attempt (User)

# Score Management
GET    /api/scores                      # Get user scores
GET    /api/scores/<id>                # Get specific score

# Analytics & Summary
GET    /api/admin/summary              # Admin dashboard analytics
GET    /api/user/summary               # User performance summary
```

### **Background Job Endpoints:**
```
POST   /api/send_daily_reminder        # Trigger daily reminders (Admin)
POST   /api/send_monthly_report        # Trigger monthly reports (Admin)
GET    /api/export_quiz_attempts       # Export user quiz data (Async)
GET    /api/export_all_user_performance # Export all user data (Admin)
GET    /api/csv_result/<task_id>       # Download generated CSV
```

### **Utility Endpoints:**
```
GET    /api/search                     # Search functionality
GET    /                               # Application entry point
```

## ⚡ Core Functionalities Implemented

### **1. Authentication & Authorization**
- ✅ **Role-based Access Control**: Admin and User roles with Flask-Security
- ✅ **Token-based Authentication**: Secure API access with authentication tokens
- ✅ **Pre-existing Admin Account**: Auto-created during application initialization
- ✅ **User Registration/Login**: Complete user management system

### **2. Admin Dashboard Features**
- ✅ **Subject Management**: Create, edit, delete subjects
- ✅ **Chapter Management**: Organize subjects into chapters
- ✅ **Quiz Management**: Create timed quizzes with date scheduling
- ✅ **Question Management**: MCQ creation with 4 options, one correct answer
- ✅ **User Search**: Search across users, subjects, and quizzes
- ✅ **Summary Charts**: Performance analytics with Chart.js visualization
- ✅ **Export Functionality**: CSV generation for all user performance data

### **3. User Dashboard Features**
- ✅ **Quiz Attempt System**: Interactive quiz-taking with real-time timer
- ✅ **Score Recording**: Automatic score calculation and storage
- ✅ **Attempt History**: View previous quiz attempts and scores
- ✅ **Subject/Chapter Selection**: Browse available quizzes by category
- ✅ **Performance Charts**: Personal performance visualization

### **4. Background Job System (Celery + Redis)**

#### **a. Scheduled Jobs:**
- ✅ **Daily Reminders**: Automated daily notifications via Google Chat webhooks
  - Checks for inactive users (no attempts in 3 days)
  - Notifies about new available quizzes
  - Configurable timing (currently set to every minute for demo)

- ✅ **Monthly Activity Reports**: HTML email reports sent monthly
  - Comprehensive performance analysis
  - Quiz attempt history with scores
  - Average performance calculations
  - Rich HTML templates with styling

#### **b. User-Triggered Async Jobs:**
- ✅ **CSV Export for Users**: Individual quiz attempt history export
- ✅ **CSV Export for Admin**: Complete user performance data export
- ✅ **Background Processing**: Non-blocking CSV generation with progress tracking
- ✅ **File Download System**: Secure file serving after generation

### **5. Performance & Caching**
- ✅ **Redis Caching**: Implemented for database query optimization
- ✅ **Cache Expiry**: 5-minute default timeout with configurable settings
- ✅ **API Performance**: Optimized database queries with caching layer

### **6. Notification System**
- ✅ **Google Chat Integration**: Webhook-based notifications for quiz updates
- ✅ **Email Integration**: SMTP-based email system with HTML templates
- ✅ **Real-time Updates**: Instant notifications for new quiz creation

## 🚀 Complete Setup & Installation Guide

### **System Prerequisites:**
```bash
# Required Software
- Python 3.8+ (with pip)
- Redis Server
- Git (for cloning repository)
- 4 Terminal windows/tabs for running services
```

### **Step-by-Step Setup Process:**

#### **Phase 1: Project Setup & Environment**

1. **Clone the Repository:**
```bash
git clone <repository-url>
cd Quiz-Master-App-Dev-II
```

2. **Create Virtual Environment:**
```bash
python3 -m venv venv
```

3. **Activate Virtual Environment:**
```bash
source venv/bin/activate
# On Windows: venv\Scripts\activate
```

4. **Install Required Packages:**
```bash
pip install setuptools  # Install setuptools first if needed
pip install -r requirements.txt
```

5. **Verify Installation:**
```bash
pip freeze  # Check installed packages
# To update requirements: pip freeze > requirements.txt
```

#### **Phase 2: Service Startup (4 Terminal Setup)**

You need to run 4 services simultaneously. Open 4 terminal windows/tabs:

**Terminal 1 - Redis Server:**
```bash
# Navigate to project directory
cd Quiz-Master-App-Dev-II

# Start Redis server
redis-server

# Alternative: Using systemd (Linux)
# sudo systemctl start redis
# To stop: sudo systemctl stop redis
```

**Terminal 2 - Celery Worker:**
```bash
# Navigate to project directory and activate environment
cd Quiz-Master-App-Dev-II
source venv/bin/activate

# Start Celery worker for background tasks
celery -A app.celery worker --loglevel INFO
```

**Terminal 3 - Celery Beat Scheduler:**
```bash
# Navigate to project directory and activate environment
cd Quiz-Master-App-Dev-II
source venv/bin/activate

# Start Celery beat for scheduled tasks
celery -A app.celery beat --loglevel INFO
```

**Terminal 4 - Flask Application:**
```bash
# Navigate to project directory and activate environment
cd Quiz-Master-App-Dev-II
source venv/bin/activate

# Start Flask development server
python3 app.py
```

#### **Phase 3: Access & Testing**

6. **Access the Application:**
```
🌐 URL: http://localhost:5000
📱 Application will be running on Flask development server
```

7. **Login Credentials:**
```
👑 Admin Account:
   Email: user0@admin.com
   Password: 1234

👤 Test User Account:
   Email: user1@user.com
   Password: 1234
```

8. **Verify Services Status:**
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Check Flask server
curl http://localhost:5000  # Should return HTML response

# Monitor Celery logs in respective terminals
```

### **Service Management Commands:**

#### **Starting Services (Production Order):**
```bash
# 1. Start Redis first
redis-server

# 2. Start Celery worker
celery -A app.celery worker --loglevel INFO

# 3. Start Celery beat scheduler
celery -A app.celery beat --loglevel INFO

# 4. Start Flask application
python3 app.py
```

#### **Stopping Services:**
```bash
# Stop Flask application
Ctrl + C (in Flask terminal)

# Stop Celery worker
Ctrl + C (in worker terminal)

# Stop Celery beat
Ctrl + C (in beat terminal)

# Stop Redis server
Ctrl + C (in Redis terminal)
# Or: sudo systemctl stop redis
```

#### **Environment Management:**
```bash
# Activate virtual environment
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Remove virtual environment (if needed)
rm -rf venv

# Recreate environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **Troubleshooting Common Issues:**

#### **Redis Connection Issues:**
```bash
# Check if Redis is installed
redis-server --version

# Check if Redis is running
ps aux | grep redis

# Start Redis manually
redis-server /etc/redis/redis.conf
```

#### **Celery Issues:**
```bash
# Clear Celery beat schedule (if corrupted)
rm celerybeat-schedule

# Check Redis connection from Celery
celery -A app.celery inspect ping
```

#### **Flask Issues:**
```bash
# Check if all dependencies are installed
pip check

# Run with debug mode
export FLASK_DEBUG=1
python3 app.py
```

#### **Database Issues:**
```bash
# Database is auto-created on first run
# If issues occur, delete and let it recreate:
rm instance/lmsv2.sqlite3
python3 app.py  # Will recreate with default admin user
```

### **Development Workflow:**

1. **Daily Startup Sequence:**
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery Worker  
source venv/bin/activate && celery -A app.celery worker --loglevel INFO

# Terminal 3: Celery Beat
source venv/bin/activate && celery -A app.celery beat --loglevel INFO

# Terminal 4: Flask App
source venv/bin/activate && python3 app.py
```

2. **Testing Background Jobs:**
```bash
# Access admin dashboard to manually trigger:
# - Daily reminders
# - Monthly reports  
# - CSV exports

# Monitor Celery logs in worker terminal for job execution
```

3. **Monitoring Application:**
```bash
# Watch Flask logs in Terminal 4
# Watch Celery worker logs in Terminal 2
# Watch Celery beat logs in Terminal 3
# Redis logs in Terminal 1
```

## 💡 Additional Features Implemented

### **Beyond Core Requirements:**
- ✅ **Google Chat Notifications**: Real-time quiz update alerts
- ✅ **Rich HTML Email Templates**: Professional monthly reports
- ✅ **Chart.js Integration**: Interactive performance visualization
- ✅ **Responsive Design**: Bootstrap-based mobile-friendly UI
- ✅ **Component-based Frontend**: Modular Vue.js architecture
- ✅ **Advanced Search**: Multi-entity search functionality
- ✅ **File Export System**: Async CSV generation with download links
- ✅ **Task Progress Tracking**: Real-time async job status monitoring

### **Recommended Features:**
- ✅ **External Chart Libraries**: Chart.js for data visualization
- ✅ **Responsive UI**: Bootstrap 5.3 for mobile compatibility
- ✅ **Form Validation**: Frontend and backend validation
- ✅ **Professional Styling**: Modern UI/UX design

## 🏃 Application Usage

### **Admin Workflow:**
1. Login with admin credentials
2. Create subjects and chapters
3. Add quizzes with questions
4. Monitor user performance via analytics
5. Export performance reports
6. Send manual reminders and reports

### **User Workflow:**
1. Register and login
2. Browse available quizzes by subject/chapter
3. Attempt quizzes with timer functionality
4. View scores and performance history
5. Export personal quiz data
6. Receive automated reminders and reports

## 📊 Performance Monitoring

### **Caching Strategy:**
- Database query results cached in Redis
- 5-minute cache expiry for optimal performance
- Automatic cache invalidation on data updates

### **Background Processing:**
- Asynchronous CSV generation prevents UI blocking
- Email sending via background tasks
- Scheduled jobs for automated operations

## 🔒 Security Features

- **Password Hashing**: Bcrypt-based secure password storage
- **Token Authentication**: Secure API access control
- **Role-based Permissions**: Admin/User access differentiation
- **CSRF Protection**: Built-in Flask-Security features
- **Input Validation**: Frontend and backend validation layers

## 📁 Project Structure

```
Quiz-Master-App-Dev-II/
├── app.py                      # Main application entry point
├── requirements.txt            # Python dependencies
├── celery_config.py           # Celery configuration
├── Command-Server.txt         # Server startup commands
├── application/
│   ├── __init__.py
│   ├── config.py              # Application configuration
│   ├── database.py            # Database initialization
│   ├── models.py              # SQLAlchemy models
│   ├── resources.py           # Flask-RESTful API resources
│   ├── routes.py              # Flask routes
│   ├── tasks.py               # Celery background tasks
│   ├── cache_config.py        # Redis cache setup
│   ├── celery_init.py         # Celery initialization
│   ├── mail.py                # Email functionality
│   └── utils.py               # Utility functions
├── static/
│   ├── script.js              # Main Vue.js application
│   ├── quiz_master.png        # Application logo
│   ├── components/            # Vue.js components
│   └── *.csv                  # Generated export files
├── templates/
│   ├── index.html             # Application entry point
│   └── mail_details.html      # Email template
└── instance/
    └── lmsv2.sqlite3          # SQLite database
```

## 🎥 Demo Video

The application demo video showcases:
- Complete admin and user workflows
- Real-time quiz functionality
- Background task processing
- Performance analytics
- Email and notification systems

**Video Link**: [To be provided in project submission]

## 📝 Future Enhancements

- OAuth integration for social login
- Real-time collaborative quizzes
- Advanced analytics with more chart types
- Mobile app development
- Payment gateway integration for premium features
- WebSocket implementation for live updates

---

**Note**: This application fully complies with the Modern Application Development II project requirements and demonstrates advanced web development concepts including asynchronous processing, caching, role-based access control, and responsive design.

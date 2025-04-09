# Web Application with Flask Backend and JavaScript Frontend

This is a full-stack web application that demonstrates the integration of a Python Flask backend with a JavaScript frontend. The application includes user authentication, database operations, and dynamic content loading.

## Project Structure

```
project/
├── app.py              # Flask application (Python backend)
├── requirements.txt    # Python dependencies
├── static/            # Static files
│   ├── styles.css     # CSS styles
│   └── script.js      # JavaScript code
├── templates/         # HTML templates
│   ├── index.html     # Main page
│   ├── login.html     # Login page
│   └── register.html  # Registration page
└── instance/          # Database and instance files
    └── site.db        # SQLite database (created automatically)
```

## Python Backend (Flask)

### Key Components

1. **Database Models**
```python
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    features = db.relationship('Feature', backref='author', lazy=True)
```
- Uses SQLAlchemy ORM for database operations
- Implements UserMixin for authentication
- Stores hashed passwords for security

2. **Authentication System**
```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('home'))
```
- Handles user login/logout
- Manages sessions
- Protects routes with @login_required

3. **API Endpoints**
```python
@app.route('/api/features', methods=['GET'])
def get_features():
    features = Feature.query.all()
    return jsonify([{
        'id': feature.id,
        'title': feature.title,
        'description': feature.description,
        'author': feature.author.username
    } for feature in features])
```
- Provides RESTful API endpoints
- Returns JSON data
- Handles CRUD operations

## JavaScript Frontend

### Key Components

1. **Dynamic Content Loading**
```javascript
async function fetchFeatures() {
    try {
        const response = await fetch('/api/features');
        const features = await response.json();
        displayFeatures(features);
    } catch (error) {
        console.error('Error fetching features:', error);
    }
}
```
- Uses Fetch API for HTTP requests
- Handles asynchronous operations
- Updates DOM dynamically

2. **Form Handling**
```javascript
const featureForm = document.getElementById('featureForm');
if (featureForm) {
    featureForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = document.getElementById('featureTitle').value;
        const description = document.getElementById('featureDescription').value;
        // ... API call and error handling
    });
}
```
- Prevents default form submission
- Collects form data
- Sends data to backend
- Handles responses

3. **Animation and UI Effects**
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
});
```
- Uses Intersection Observer API
- Implements scroll animations
- Enhances user experience

## Database Management

### Viewing Database Contents

1. **Using DB Browser for SQLite (Recommended)**
   - Download from: https://sqlitebrowser.org/dl/
   - Install and open the application
   - Click "Open Database"
   - Navigate to `instance/site.db`
   - Use "Browse Data" tab to view tables

2. **Using SQLite Command Line**
   ```bash
   # Install SQLite
   # Download from: https://www.sqlite.org/download.html
   # Add to PATH

   # View database
   sqlite3 instance/site.db
   
   # Inside SQLite prompt:
   .tables           # Show all tables
   .schema          # Show database structure
   SELECT * FROM user;   # View all users
   .quit           # Exit SQLite
   ```

3. **Using Python Script**
   ```bash
   # Run the provided script
   python view_users.py
   ```

### Database Structure

1. **User Table**
   - id (Primary Key)
   - username (Unique)
   - email (Unique)
   - password_hash (Hashed password)

2. **Feature Table**
   - id (Primary Key)
   - title
   - description
   - user_id (Foreign Key to User)

## Setup and Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

3. Access the application:
- Open browser and go to `http://localhost:5000`
- Register a new account
- Log in and start adding features

## Troubleshooting

1. **Database Connection Issues**
   - Ensure the `instance` folder exists
   - Check file permissions
   - Verify database path in app.py

2. **SQLite Command Not Found**
   - Install SQLite from official website
   - Add to system PATH
   - Restart command prompt

3. **Module Not Found Errors**
   - Run `pip install -r requirements.txt`
   - Check Python version compatibility
   - Verify virtual environment activation

## Security Features

- Password hashing
- Session management
- Protected routes
- CSRF protection
- Input validation
- SQL injection prevention

## Best Practices Demonstrated

1. **Backend (Python/Flask)**
   - Separation of concerns
   - Database abstraction
   - Secure authentication
   - Error handling
   - API design

2. **Frontend (JavaScript)**
   - Asynchronous operations
   - DOM manipulation
   - Event handling
   - Error handling
   - UI/UX considerations

## Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [SQLite Documentation](https://www.sqlite.org/docs.html) 

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# 🔌 Database connection
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root123",   # 👉 change if needed
        database="attendance_db"
    )

# 🏠 Test route
@app.route("/")
def home():
    return "Backend running"

# 📝 Register API
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        print("DATA:", data)

        db = get_db()
        cursor = db.cursor()

        query = "INSERT INTO users (username, password, userType) VALUES (%s, %s, %s)"
        cursor.execute(query, (data["username"], data["password"], data["userType"]))

        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "User registered successfully"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

# 🔐 Login API
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json

        db = get_db()
        cursor = db.cursor(dictionary=True)

        query = "SELECT * FROM users WHERE username=%s AND password=%s AND userType=%s"
        cursor.execute(query, (data["username"], data["password"], data["userType"]))

        user = cursor.fetchone()

        cursor.close()
        db.close()

        if user:
            return jsonify({"message": "Login successful"})
        else:
            return jsonify({"error": "Account not found"})   # ✅ CUSTOM MESSAGE

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Server error"}), 500
        
@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    query = "INSERT INTO students (rollNo, name) VALUES (%s, %s)"
    cursor.execute(query, (data["rollNo"], data["name"]))

    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Student added"})
    
@app.route("/get_students", methods=["GET"])
def get_students():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(students)
    
@app.route("/save_attendance", methods=["POST"])
def save_attendance():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    for record in data:
        query = """
        INSERT INTO attendance (subject, date, rollNo, name, present)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            record["subject"],
            record["date"],
            record["rollNo"],
            record["name"],
            record["present"]
        ))

    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Attendance saved"})
    
@app.route("/add_faculty", methods=["POST"])
def add_faculty():
    try:
        data = request.json

        # 🔴 ✅ PLACE VALIDATION HERE
        if not data["username"].strip() or not data["password"].strip():
            return jsonify({"error": "Fields cannot be empty"})

        db = get_db()
        cursor = db.cursor()

        # Duplicate check
        cursor.execute("SELECT * FROM users WHERE username=%s", (data["username"],))
        existing = cursor.fetchone()

        if existing:
            return jsonify({"error": "Username already exists"})

        # Insert
        query = "INSERT INTO users (username, password, userType) VALUES (%s, %s, %s)"
        cursor.execute(query, (data["username"], data["password"], "faculty"))

        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Faculty account created"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Server error"}), 500
        
@app.route("/get_faculty", methods=["GET"])
def get_faculty():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE userType='faculty'")
    faculty = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(faculty)
    
@app.route("/delete_faculty/<int:id>", methods=["DELETE"])
def delete_faculty(id):
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("DELETE FROM users WHERE id=%s", (id,))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Faculty deleted successfully"})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Delete failed"}), 500
        
@app.route("/update_faculty/<int:id>", methods=["PUT"])
def update_faculty(id):
    try:
        data = request.json

        db = get_db()
        cursor = db.cursor()

        query = "UPDATE users SET username=%s, password=%s WHERE id=%s"
        cursor.execute(query, (data["username"], data["password"], id))

        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Faculty updated successfully"})
    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Update failed"}), 500
        
@app.route("/update_student/<int:id>", methods=["PUT"])
def update_student(id):
    data = request.json

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE students SET rollNo=%s, name=%s WHERE id=%s",
        (data["rollNo"], data["name"], id)
    )

    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Student updated successfully"})

@app.route("/delete_student/<int:id>", methods=["DELETE"])
def delete_student(id):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("DELETE FROM students WHERE id=%s", (id,))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Student deleted successfully"})

    app.run(debug=True)
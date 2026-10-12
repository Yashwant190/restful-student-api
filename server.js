const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "RESTful Student API is running",
        version: "1.0.0"
    });
});

// CREATE STUDENT
app.post("/api/students", (req, res) => {

    const { name, email, course, age } = req.body;

    if (!name || !email || !course || !age) {
        return res.status(400).json({
            success: false,
            message: "Name, email, course and age are required."
        });
    }

    if (age < 1 || age > 100) {
        return res.status(400).json({
            success: false,
            message: "Age must be between 1 and 100."
        });
    }

    const sql = `
        INSERT INTO students (name, email, course, age)
        VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [name, email, course, age], function (err) {

        if (err) {

            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to create student.",
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Student created successfully.",
            student: {
                id: this.lastID,
                name,
                email,
                course,
                age
            }
        });
    });
});

// GET ALL STUDENTS
app.get("/api/students", (req, res) => {

    db.all(
        "SELECT * FROM students ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch students.",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                count: rows.length,
                students: rows
            });
        }
    );
});

// GET STUDENT BY ID
app.get("/api/students/:id", (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT * FROM students WHERE id = ?",
        [id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error.",
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }

            res.status(200).json({
                success: true,
                student: row
            });
        }
    );
});

// UPDATE STUDENT
app.put("/api/students/:id", (req, res) => {

    const id = req.params.id;
    const { name, email, course, age } = req.body;

    if (!name || !email || !course || !age) {
        return res.status(400).json({
            success: false,
            message: "Name, email, course and age are required."
        });
    }

    if (age < 1 || age > 100) {
        return res.status(400).json({
            success: false,
            message: "Age must be between 1 and 100."
        });
    }

    const sql = `
        UPDATE students
        SET name = ?,
            email = ?,
            course = ?,
            age = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [name, email, course, age, id],
        function (err) {

            if (err) {

                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already exists."
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "Failed to update student.",
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Student updated successfully."
            });
        }
    );
});

// DELETE STUDENT
app.delete("/api/students/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM students WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete student.",
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }

            res.status(200).json({
                success: true,
                message: "Student deleted successfully."
            });
        }
    );
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// Error handling middleware
app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// Start server
app.listen(PORT, () => {

    console.log("---------------------------------------");
    console.log("RESTful Student API");
    console.log("---------------------------------------");
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log("---------------------------------------");

});
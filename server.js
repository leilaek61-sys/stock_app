const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("stock.db");

// create table
db.run(`
CREATE TABLE IF NOT EXISTS produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    quantite INTEGER,
    prix REAL
)
`);

// GET
app.get("/produits", (req, res) => {
    db.all("SELECT * FROM produits", [], (err, rows) => {
        res.json(rows);
    });
});

// POST
app.post("/produits", (req, res) => {
    const { nom, quantite, prix } = req.body;
    db.run(
        "INSERT INTO produits (nom, quantite, prix) VALUES (?, ?, ?)",
        [nom, quantite, prix],
        () => res.send("added")
    );
});

// PUT
app.put("/produits/:id", (req, res) => {
    const { nom, quantite, prix } = req.body;
    db.run(
        "UPDATE produits SET nom=?, quantite=?, prix=? WHERE id=?",
        [nom, quantite, prix, req.params.id],
        () => res.send("updated")
    );
});

// DELETE
app.delete("/produits/:id", (req, res) => {
    db.run("DELETE FROM produits WHERE id=?", req.params.id);
    res.send("deleted");
});

app.listen(3000, () => console.log("Server running..."));
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
)
`);
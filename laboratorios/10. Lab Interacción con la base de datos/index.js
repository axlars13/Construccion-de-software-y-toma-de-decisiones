const express = require('express');
const path = require('path');
const app = express();

require("dotenv").config();
const { Pool } = require("pg");

const pool =  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
    res.status(200).json({message: "OK"});
});

app.get("/test_db", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM games limit 20");
        res.status(200).json(rows);
    }catch(e){
        console.log(e);
        res.status(500).json({ msg: "Error al consultar la base de datos" });
    }
});

app.get("/buscar-inseguro", async (req, res) => {
    const titulo = req.query.titulo;
    const sql = `SELECT * FROM games WHERE title ILIKE '%${titulo}%'`;
    const { rows } = await pool.query(sql);
    res.status(200).json(rows);
});

app.get("/buscar", async (req, res) => {
    const titulo = req.query.titulo;
    const sql = `SELECT * FROM games WHERE title ILIKE $1`;
    const { rows } = await pool.query(sql, [`%${titulo}%`]);
    res.status(200).json(rows);
});

const gameRoutes = require("./routes/game.routes");
app.use("/games", gameRoutes);

app.listen(3000);
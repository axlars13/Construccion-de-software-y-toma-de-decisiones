const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send("Hello World!");
    res.end();
});

app.get("/test_ejs", (req, res) => {
    let frases = [];

    frases.push("Frase 1");
    frases.push("Frase 2");
    frases.push("Frase 3");
    frases.push("Frase 4");
    frases.push("Frase 5");

    res.render("index", {
        frases: frases
    });
});

app.listen(3000);
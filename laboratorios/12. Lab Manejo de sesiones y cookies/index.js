const express = require('express');
const path    = require('path');
const app     = express();
const cookieParser = require('cookie-parser');
const session = require("express-session");
const cors = require('cors');
const { doubleCsrf } = require('csrf-csrf');

const {
    generateCsrfToken,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret:            () => process.env.CSRF_SECRET || 'cambia-esto-en-desarrollo',
    getSessionIdentifier: (req) => req.session.id,
    cookieName:           'x-csrf-token',
    cookieOptions:        { httpOnly: true, sameSite: 'lax', secure: false },

    // Por default csrf-csrf v4 solo busca el token en el header x-csrf-token.
    // Como nuestro <form> lo envía en el body como input hidden, le decimos
    // explícitamente que también revise req.body.
    getCsrfTokenFromRequest: (req) => req.body['x-csrf-token'] || req.headers['x-csrf-token']
}); 

//Permite cualquier origen (útil en desarrollo, no en producción)
app.use(cors({
    origin: [
        "https://miapp.com", 
        "https://www.miapp.com",
        "http://localhost:3000",
        "http://google.fonts.com",
        "http://cdn.jsdelivr.net",
        "https://cdn.jsdelivr.net"
    ], // Reemplaza con tus dominios permitidos
    credentials: true
}));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(cookieParser());
app.use(session({
    secret: 'mi string secreto que debe ser un string aleatorio muy largo, no como éste',
    resave: false,
    saveUninitialized: true, // necesario para csrf-csrf: el token se firma con el session ID
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // Pon true cuando despliegues a HTTPS
    }
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Orden importante:
// 1. PRIMERO validar el token del request entrante (POST/PUT/DELETE).
app.use(doubleCsrfProtection);

// 2. DESPUÉS generar un token nuevo para la siguiente vista.
//    Si invirtieras el orden, regenerarías el token antes de validarlo
//    y la validación pasaría siempre — anulando la protección.
app.use((req, res, next) => {
    res.locals.csrfToken = generateCsrfToken(req, res);
    next();
});




app.get('/', (req, res) => {
    res.cookie("mi_cookie", "123", { 
        httpOnly: true,
        sameSite: "lax",
        secure: false, // Pon true cuando despliegues a HTTPS
    });
    res.type('text/plain');
    res.send('Hola Mundo');
});

app.get("/test_cookie", (req, res) => {
    const valor = req.cookies.mi_cookie;
    res.type('text/plain');
    res.send(valor || "No hay cookie llamada mi_cookie");
});

app.get("/test_session", (req, res) => {
    req.session.mi_variable = "valor";
    res.type('text/plain');
    res.send(req.session.mi_variable);
});

app.get("/test_session_variable", (req, res) => {
    const valor = req.session.mi_variable;
    res.type('text/plain');
    res.send(valor || "No hay variable de sesión llamada mi_variable");
});

app.get("/logout", (req, res) => {
    //CU Logout pero con BD

    req.session.destroy(()=>{
        res.redirect("/");
    });
});

app.get("/buscar", (req, res) => {
    const q = req.query.q || "";
    res.send("<h1>Resultados de búsqueda para: " + q + "</h1>");
});

app.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
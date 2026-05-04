const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const { doubleCsrf } = require("csrf-csrf");
const helmet = require('helmet');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
    secret: 'mi_string_secreto_para_el_lab',
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());

const { doubleCsrfProtection } = doubleCsrf({
    getSecret: (req) => "secreto_para_csrf",
    cookieName: "x-csrf-token",
    cookieOptions: { sameSite: "lax", secure: false },
});

app.use(doubleCsrfProtection);

app.use((request, response, next) => {
    response.locals.csrfToken = request.csrfToken();
    response.locals.error = request.flash('error');
    next();
});

const rutasUsuarios = require('./routes/usuarios.routes');
app.use('/usuarios', rutasUsuarios);

app.get('/', (request, response) => {
    response.redirect('/usuarios/login');
});

app.listen(3000);
const model = require("../models/usuarios.model.js");
const bcrypt = require('bcryptjs');

module.exports.render_login = (req, res) => {
    res.render("usuarios/login", {
        registro: false
    });
};

module.exports.do_login = async (req, res) => {
    try {
        const usuario = await model.User.findByUsername(req.body.username);
        if (!usuario) {
            req.flash('error', 'Usuario o contraseña incorrectos');
            return res.redirect("/usuarios/login");
        }

        const doMatch = await bcrypt.compare(req.body.password, usuario.password);
        if (!doMatch) {
            req.flash('error', 'Usuario o contraseña incorrectos');
            return res.redirect("/usuarios/login");
        }

        req.session.username = usuario.username;
        req.session.isLoggedIn = true;
        res.redirect("/usuarios/logged");
    } catch (e) {
        console.error(e);
        res.redirect("/usuarios/login");
    }
};

module.exports.get_logged = async (req, res) => {
    const usuario = await model.User.findByUsername(req.session.username);
    res.render("usuarios/logged", { user: usuario });
};

module.exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/usuarios/login');
    });
};

module.exports.get_registro = (req, res) => {
    res.render('usuarios/registro', { registro: true });
};

module.exports.post_registro = async (req, res) => {
    try {
        const { username, name, password } = req.body;
        const user = new model.User(username, name, password);
        await user.save();
        res.redirect('/usuarios/login');
    } catch (e) {
        req.flash('error', 'Error al registrar el usuario');
        res.redirect('/usuarios/registro');
    }
};
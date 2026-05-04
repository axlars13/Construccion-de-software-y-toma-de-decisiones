const db = require('../util/database');
const bcrypt = require('bcryptjs');

module.exports = class User {
    constructor(username, name, password) {
        this.username = username;
        this.name = name;
        this.password = password;
    }

    async save() {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 12);
            return db.query(
                'INSERT INTO usuarios (username, nombre, password) VALUES ($1, $2, $3)',
                [this.username, this.name, hashedPassword]
            );
        } catch (e) {
            console.error(e);
            throw new Error('Error al guardar usuario');
        }
    }

    static async findByUsername(username) {
        try {
            const result = await db.query(`
                SELECT u.username, u.password, p.nombre as permiso
                FROM usuarios u
                LEFT JOIN usuario_rol ur ON u.username = ur.username
                LEFT JOIN roles r ON ur.id_rol = r.id
                LEFT JOIN rol_permiso rp ON r.id = rp.id_rol
                LEFT JOIN permisos p ON rp.id_permiso = p.id
                WHERE u.username = $1
            `, [username]);

            if (result.rows.length === 0) return null;

            const usuario = {
                username: result.rows[0].username,
                password: result.rows[0].password,
                permisos: result.rows.map(row => row.permiso).filter(p => p !== null)
            };
            return usuario;
        } catch (e) {
            console.error(e);
            throw new Error('Error al buscar usuario');
        }
    }
};
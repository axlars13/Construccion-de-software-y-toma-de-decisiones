module.exports = (permiso) => {
    return (request, response, next) => {
        if (!request.session.permisos || !request.session.permisos.includes(permiso)) {
            return response.status(403).send('No tienes permiso para ver esta sección');
        }
        next();
    };
};
const log = console.log;

exports.ObtenerAlertas = function(){
    log("Obtener Alertas");

    let alertas = [];

    alertas.push({
        id: 1,
        titulo: "Alerta 1",
        active: true,
        idUser: 1
        });
    alertas.push({
        id: 2,
        titulo: "Alerta 2",
        active: true,
        idUser: 1
        });
    alertas.push({
        id: 1,
        titulo: "Alerta 3",
        active: false,
        idUser: 2
        });
    alertas.push({
        id: 2,
        titulo: "Alerta 4",
        active: true,
        idUser: 1
        });
    return alertas;
}
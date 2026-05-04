let log = console.log;

const http = require('http');
const filesystem = require('fs');

function calcularPromedio(arreglo) {
    let suma = 0;

    for (let i = 0; i < arreglo.length; i++) {
        suma = suma + arreglo[i];
    }

    let promedio = suma / arreglo.length;
    return promedio;
}

let numeros = [10, 20, 30, 40];
let resultado = calcularPromedio(numeros);
log("El promedio es: " + resultado);

filesystem.writeFileSync('hola.txt', 'Hola mundo desde node');

function factorial(n) {
    let resultado = 1;

    for (let i = 1; i <= n; i++) {
        resultado = resultado * i;
    }

    return resultado;
}

log("Factorial de 5: " + factorial(5));

const server = http.createServer((req, res) => {

    log(req.url);

    res.setHeader("Content-Type", "text/html");

    if (req.url === "/") {
        let pagina = filesystem.readFileSync("pagina.html", "utf8");
        res.write(pagina);
        res.end();
    } else {

        res.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <title>HTML</title>
            </head>
            <body>

            <h1>Hola mundo desde Node</h1>
            <p>Esta es mi práctica de backend</p>

            <javascript>
                console.log("Hello");
            </javascript>

            </body>
            </html>
        `);

        res.end();
    }
});

server.listen(4141, () => {
    log("Mi servidor está vivo corriendo en el puerto 4141");
});
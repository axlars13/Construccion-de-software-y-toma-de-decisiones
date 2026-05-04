const http = require("http");

const server = http.createServer((req, res) => {
    switch(req.url){
        case "/":
            res.setHeader("Content-Type", "text/html");
            res.write("URL index /");
            res.end();
            break;
        case "/test_json":
            if(req.method == "GET"){
                res.setHeader("Content-Type", "application/json");
                res.write('{code: 200, msg:"Ok GET"}');
                res.end();
            }else if(req.method == "POST"){
                res.setHeader("Content-Type", "application/json");
                res.write('{code: 200, msg:"Ok POST"}');
                res.end();
            }    
            break;        
        case "/test_html":
            res.setHeader('Content-Type', 'text/html');    
            res.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>Código en HTML</title>
                </head>
                <body>
                <h1>hola mundo desde node</h1>
                </body>
                </html>
            `);
            res.end();   
            break;
        case "/form_method":
            if(req.method == "GET"){
                const path = require("path");
                const fs = require("fs");

                res.setHeader('Content-Type', 'text/html');
                const html = fs.readFileSync(path.resolve(__dirname, "./form.html"), "utf-8");
                res.write(html);
                res.end();
            }else if(req.method == "POST"){
                let body = [];
                req
                .on('data', chunk => {
                    body.push(chunk);
                })
                .on('end', () => {
                    body = Buffer.concat(body).toString();
                    console.log(body)

                    const indice = Number(body.split('&')[0].split('=')[1]);
                    console.log(indice);
                    const imprimir = body.split('&')[1].split('=')[1];
                    console.log(imprimir);

                    for(var i = 1; i <= indice; i++){
                        console.log(imprimir)
                        }
                        const fs = require("fs");
                        fs.writeFileSync("datos.txt", body); 

                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.write('{code:200, msg:"Ok POST"}');
                    res.end();
                });  


            }
            break;
        default:
            res.statusCode = 404;
            res.end();
            break;
    }
});

server.listen(3001, () => {
console.log("Server is running on port 3001");
});
const Config = require('./config')

const Express = require('express');
const { type } = require('os');
const WebSocket = require('ws');

const app = Express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ ...Config.wssConfigs, server: server });

// = WEB SOCKET ==

let chat = [];
const wsEvents = {
    SetId: 'SetId',
    Chat: 'Chat',
}


// quando alguem se conecta ao server
wss.on('connection', 
(ws, req) => {

    console.log('Cliente conectado: ' + req.socket.remoteAddress);
  
    // quando este cliente manda uma mensagem
    ws.on('message', 
    (data) => {

        data = JSON.parse(data.toString());
        console.log('recebeu: ', data);

        switch(data.type){
        case wsEvents.SetId:
            ws['id'] = data.id; 
            ws['nome'] = data.nome; 
            break;
        
        case wsEvents.Chat:
        default:

            let msg = {
                nome: ws['nome'],
                message: data.message
            }

            chat.push(msg);
      
            // itera sobre clientes (ws)
            wss.clients.forEach(
            (client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify(msg));
                }
            });
            
        }


    });

    // quando este cliente se desconecta
    ws.on('close', 
    (data) => {
        console.log('cliente desconectado: ' + req.socket.remoteAddress)
    });
});


// = HTTP ==

app.get('/', 
(req, res) => { 
    res.send('Hello World!');
});


app.get('/listarConexoes', 
(req, res) => {

    conns = [...wss.clients].filter((c) => c.readyState === WebSocket.OPEN)

    res.send({ 
        qtd: conns.length,
        conexoes: conns.map(c => ({ nome: c['nome'], id: c['id'] }))
    });
});


app.get('/getChatHistory', 
(req, res) => {
    res.send({
        chat: chat, 
        qtd: chat.length 
    });
});


// = SERVER ==

server.listen(Config.expressConfigs.port,
() => {
    console.log(`Lisening on port: ` + Config.expressConfigs.port);
});

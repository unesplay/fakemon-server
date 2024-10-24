const Config = require('./config');
const WSEvents = require('./wsEvents');

const Express = require('express');
const { type } = require('os');
const WebSocket = require('ws');

const app = Express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ ...Config.wssConfigs, server: server });

// = WEB SOCKET ==

let salas = {};
// let chat = [];

// quando alguem se conecta ao server
wss.on('connection', 
(ws, req) => {

    console.log('Cliente conectado: ' + req.socket.remoteAddress);
  
    let result = null;
    
    // quando este cliente manda uma mensagem
    ws.on('message', 
    (data) => {

        data = JSON.parse(data.toString());
        console.log('recebeu: ', data);

        switch(data.type){
        case WSEvents.Events.SetId:
            WSEvents.Functions.SetId(ws, data);
            break;

        case WSEvents.Events.NovaSala:
            // TODO: IF NOT NAME RETURN

            result = WSEvents.Functions.NovaSala(ws, data, salas);

            if(!result){
                // erro e pa
                break;
            }

            let idNovaSala = result
            // sem break;

        case WSEvents.Events.EntrarSala:
            // if ws.sala is set BREAK
            // if salas[id] is not set BREAK    
            
            try{
                idEntrarSala = idNovaSala;
            } 
            catch(ex){
                idEntrarSala = data.salaId
            }

            result = WSEvents.Functions.EntrarSala(ws, data, salas, idEntrarSala);

            break;

        case WSEvents.Events.SairSala:
           result = WSEvents.Functions.SairSala(ws, data, salas);
            // fulano saiu :(

            break;

        // mensagem no chat
        case WSEvents.Events.ChatSala:

            result = WSEvents.Functions.ChatSala(ws, data, salas);
            // if(result) { chat.push(msg); }
            if(!result){
                ws.send(JSON.stringify({
                    nome: 'NOME',
                    message: 'Conecte-se a uma sala!!!!'
                }));
            }

        break;

        // mensagem no chat
        case WSEvents.Events.Chat:
        default:

            result = WSEvents.Functions.Chat(ws, data, [...wss.clients].filter(isClientValid));
            // if(result) { chat.push(msg); }

            break;
        }
    });

    // quando este cliente se desconecta
    ws.on('close', 
    (data) => {
        if(ws['sala'] !== ''){
            result = WSEvents.Functions.SairSala(ws, data, salas);
        }

        console.log('cliente desconectado: ' + req.socket.remoteAddress)
    });
});

// = HTTP ==

const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
}


app.get('/', 
(req, res) => { 
    res.set(defaultHeaders);
    res.send('Hello World!');
});


app.get('/listarConexoes', 
(req, res) => {

    conns = [...wss.clients].filter(isClientValid)

    res.set(defaultHeaders);
    res.send({ 
        qtd: conns.length,
        conexoes: conns.map(c => ({ nome: c['nome'], id: c['id'] }))
    });
});


app.get('/listarSalas', 
(req, res) => {

    slist = Object.entries(salas).map((s) => ({ nome: s[1]['nome'], id: s[0], state: s[1]['state'] }));
    slist = slist.filter((s) => s.state !== WSEvents.SalaStates.Cheia);

    res.set(defaultHeaders);
    res.send({ 
        qtd: salas.length,
        salas: slist 
    });
});


// app.get('/getChatHistory', 
// (req, res) => {
//     res.send({
//         chat: chat, 
//         qtd: chat.length 
//     });
// });


// = SERVER ==

server.listen(Config.expressConfigs.port,
() => {
    console.log(`Lisening on port: ` + Config.expressConfigs.port); 
});


// = ==

function isClientValid(c) { return c.readyState === WebSocket.OPEN }

function isSet(v) { return typeof v !== 'undefined' }

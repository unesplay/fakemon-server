const events = {
    SetId: 'SetId',
    Chat: 'Chat',
    ChatSala: 'ChatSala',
    NovaSala: 'NovaSala',
    EntrarSala: 'EntrarSala',
    SairSala: 'SairSala',
}

const salaStates = {
    Vazia: 'Vazia',
    Aberta: 'Aberta',
    Cheia: 'Cheia',
}

function setId(ws, data)
{
    ws['id'] = data.id; 
    ws['nome'] = data.nome; 
    ws['sala'] = null; 
}

function novaSala(ws, data, salas)
{
    // TODO: IF NOT NAME RETURN

    let salaId = ws['nome'] +  '-' + new Date().valueOf().toString();
    let salaNome = (data.salaNome) ? data.salaNome : 'sala de ' + ws['nome'];  
    
    let sala = {
        nome: salaNome,
        state: salaStates.Vazia,
        p1: null,
        p2: null,
    }

    salas[salaId] = sala;

    return salaId;
}

function entrarSala(ws, data, salas, salaId)
{
    if(ws.sala !== null || !(salaId in salas)){
        return false;
    }

    if(salas[salaId].state === salaStates.Vazia) {
        salas[salaId].p1 = ws;
        salas[salaId].state = salaStates.Aberta;
        ws['sala'] = salaId
    }
    else if(salas[salaId].state === salaStates.Aberta) {
        salas[salaId].p2 = ws;
        salas[salaId].state = salaStates.Cheia;
        ws['sala'] = salaId

    }
    else if(salas[salaId].state === salaStates.Cheia) {
        // ERRO
    }

    return true;
}

function sairSala(ws, data, salas)
{
    let salaId = ws['sala'];
    if(!(salaId in salas)){
        return false;
    }

    if(salas[salaId].state === salaStates.Cheia) {

        if(salas[salaId].p1 === ws){
            salas[salaId].p1 = salas[salaId].p2;
            salas[salaId].p2 = null;
        }
        else if(salas[salaId].p2 === ws){
            salas[salaId].p2 = null;
        }

        salas[salaId].state = salaStates.Aberta;
        ws['sala'] = null;
    }
    else if(salas[salaId].state === salaStates.Aberta) {
        delete salas[salaId];
        ws['sala'] = null;

    }
    else if(salas[salaId].state === salaStates.Vazia) {
        // ERRO
    }

    return true;
}


function chat(ws, data, clients)
{
    let msg = {
        nome: ws['nome'],
        message: data.message
    };

    // itera sobre clientes (ws)
    clients.forEach(
    (client) => {
        if (client !== ws) {
            client.send(JSON.stringify(msg));
        }
    });

    return true;
}


function chatSala(ws, data, salas)
{
    let salaId = ws['sala'];
    if(!(salaId in salas)){
        return false;
    }
    
    let msg = {
        sala: salas[salaId].nome,
        nome: ws['nome'],
        message: data.message
    }

    clients = [salas[salaId].p1, salas[salaId].p2];

    clients.forEach(
    (client) => {
        if (client !== ws && client !== null) {
            client.send(JSON.stringify(msg));
        }
    });

    return true;
}

module.exports = {
    Events: events,
    SalaStates: salaStates,
    Functions: {
        SetId: setId,
        Chat: chat,
        ChatSala: chatSala,
        NovaSala: novaSala,
        EntrarSala: entrarSala,
        SairSala: sairSala,        
    }
}
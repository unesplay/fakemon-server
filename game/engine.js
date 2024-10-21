function getPrio(a1, a2, gs)
{
    // default aleatorio
    prio = (Date.now() % 2 == 0) ? 1 : 2;

    // trocas sempre tem prioridade sob movimentos
    if(a1.tipo != a2.tipo){
        prio = (a1.tipo == 'troca') ? 1 : 2;
    }
    else if(a1.tipo == 'movimento'){

        // velocidades 
        v1 = gs.p1.mons[gs.p1.currMon].vel;
        v2 = gs.p2.mons[gs.p2.currMon].vel;

        // desempate por prio
        if (a1.prio != a2.prio){
            prio = (a1.prio > a2.prio) ? 1 : 2; 
        } 
        // desempate por velocidade
        else if(v1 != v2){
            prio = (v1 > v2) ? 1 : 2; 
        }
    }
    
    return prio;
}

function turno(gameState, acaoP1, acaoP2)
{
    let prio = getPrio( acaoP1, acaoP2, gameState);
    turnStack = [];

    if(prio == 1){
        turnStack.push(...realizaAcao(gameState, acaoP1, 1));
        turnStack.push(...realizaAcao(gameState, acaoP2, 2));
    }
    else{
        turnStack.push(...realizaAcao(gameState, acaoP2, 2));
        turnStack.push(...realizaAcao(gameState, acaoP1, 1));
    }

    gameState.turnNo += 1
    gameState.turnStack = turnStack;

    return gameState
}

gameState = {
    p1: {
        mons: [],
        currMon: 0,
        campo: 0
    },
    clima: '',
    turnNo: 0,
    turnStack: []
}
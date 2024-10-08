require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Benvenuto nel roguelike di Luca!", {
        "reply_markup": {
            "keyboard": [["/move Nord", ], ["/move Ovest", "/status", "/move Est"], ["/move Sud"]]
        }
    });
});


// Costanti roll
const min = 1;
const max = 10;

// Costanti mappa
const MAP_SIZE = 6; 
const EMPTY_CELL = '⬜'; // Emoji celle vuote
const PLAYER_ICON = '⚜️'; // Emoji giocatore
const MOB_ICON = '🐉'; // Emoji troll per il mob


// Funzione per generare la salute del mob
function mobhp() {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let mob = {
    hp: Math.floor(Math.random() * (10 - 1 + 1)) + 1,
    position: { x: 1, y: 1 },
    alive: 1
};

let player = {
    hp: 10,
    position: { x: 0, y: 0 }
};

function renderMap() {
    let map = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(EMPTY_CELL));
    
    // Posiziona il giocatore e il mob sulla mappa
    map[player.position.y][player.position.x] = PLAYER_ICON;
    map[mob.position.y][mob.position.x] = MOB_ICON;

    return map.map(row => row.join('')).join('\n');
}


// Comandi 

bot.onText(/\/map/, (msg) => {
    bot.sendMessage(msg.chat.id, renderMap());
});


bot.onText(/\/move (.+)/, (msg, match) => {
    const direction = match[1].toLowerCase();
    bot.sendMessage(msg.chat.id, renderMap())

    if (direction === 'nord') player.position.y += 1;
    if (direction === 'sud') player.position.y -= 1;
    if (direction === 'ovest') player.position.x -= 1;
    if (direction === 'est') player.position.x += 1;

    // Controllo se la posizione del player coincide con quella del mob
    if (player.position.x === mob.position.x && player.position.y === mob.position.y) {
        mob.hp = mobhp();
        bot.sendMessage(msg.chat.id, `Ti sei mosso a ${direction}. Incontri un pericoloso Diddy selvatico con ` + mob.hp + " hp!", {
            "reply_markup": {
                "keyboard": [["/attack", "/status"]]
            }
            });
    }
    else {
        bot.sendMessage(msg.chat.id, `Ti sei mosso a ${direction}. La tua nuova posizione è (${player.position.x}, ${player.position.y})`);
    }
    
});

// Comando per mostrare lo stato del giocatore
bot.onText(/\/status/, (msg) => {
    bot.sendMessage(msg.chat.id, `HP: ${player.hp}, Posizione: (${player.position.x}, ${player.position.y})`);
});

bot.onText(/\/attack/, (msg) => {
    //danni al mob
    mob.hp -= Math.floor(Math.random() * (max - min + 1)) + min
    if(mob.hp > 0) {
        bot.sendMessage(msg.chat.id, "Attacchi il pericoloso Diddy. Ora ha" + mob.hp + " hp!");
    }
    else if (mob.hp <= 0 && mob.alive === 1) {
        bot.sendMessage(msg.chat.id, "Dai il colpo di grazia al pericolosissimo Diddy, che muore!");
        mob.alive = 0
    }
    else {
        bot.sendMessage(msg.chat.id, "Diddy è già morto!");
    }
    
});
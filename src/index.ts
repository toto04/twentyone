import express from 'express'
import { createServer } from 'http'
import { GameMessage } from 'typedefs'
import { Game } from './game'
import WebSocket from 'ws'

const app = express()
const server = createServer(app)
const wss = new WebSocket.Server({ server })

app.use(express.json())

let games = new Map<string, {
    players: WebSocket[]
    istance: Game
}>()

let updateGameState = (gameCode: string) => {
    let game = games.get(gameCode)
    if (!game) throw 'unknown gamecode, 🎶 how did this happen? 🎶'
    game.players.forEach((ws, i) => {
        let update: GameMessage = {
            command: 'update',
            info: { gameCode },
            data: game!.istance.getGameState(i)
        }
        ws.send(JSON.stringify(update))
    })
}

let sendMessage = (gameCode: string, message: string, inverse?: boolean) => {
    let game = games.get(gameCode)
    if (!game) throw 'unknown gamecode'
    let msg: GameMessage = {
        command: 'message',
        info: { gameCode },
        data: {
            message
        }
    }
    game.players[inverse ? (game.istance.turn ? 0 : 1) : game.istance.turn].send(JSON.stringify(msg))
}

wss.on('connection', ws => {
    ws.on('message', msg => {
        let message: GameMessage = JSON.parse(msg.toString())
        let { command, info } = message
        let gameCode = info.gameCode?.toUpperCase() ?? ''
        let game = games.get(gameCode)

        switch (command) {
            case 'newgame':
                gameCode = getNewGameCode()
                games.set(gameCode, {
                    istance: new Game(),
                    players: [ws]
                })
                let inv: GameMessage = {
                    command: 'invite',
                    info: { gameCode },
                    data: {
                        inviteURL: `http://localhost:3000/play/${gameCode}`
                    }
                }
                ws.send(JSON.stringify(inv))
                console.log(`created new game ${gameCode}, waiting for other to join`)
                break

            case 'connect':
                if (game) {
                    game.players[1] = ws
                    game.istance.start()
                    updateGameState(gameCode)
                    console.log(`starting game ${gameCode}!`)
                }
                break

            case 'hit':
                if (!game || info?.id !== game.istance.turn) break
                console.log(`player ${info.id} played hit`)
                game.istance.giveCard()
                sendMessage(gameCode, 'L\'avversario ha pescato una carta! È il tuo turno')
                updateGameState(gameCode)
                break

            case 'stand':
                if (!game || info?.id !== game.istance.turn) break
                console.log(`player ${info.id} played stand`)
                let turnEnded = game.istance.stand()
                if (turnEnded) {
                    let ps = `${game.istance.points![0]}/${game.istance.points![1]}`
                    sendMessage(gameCode, `Hai vinto questo turno! (${ps})`, true)
                    sendMessage(gameCode, `Hai perso questo turno, tocca a te (${ps})`)
                } else sendMessage(gameCode, 'L\'avversario ha passato! È il tuo turno')
                updateGameState(gameCode)
                break

            case 'trump':
                if (!game || info?.id !== game.istance.turn) break
                let { slot } = message.data
                console.log(`player ${info.id} played trump (slot ${slot})`)
                let t = game.istance.useTrumpCard(slot)
                sendMessage(gameCode, `L'avversario ha usato la carta ${t}`, true)
                updateGameState(gameCode)
                break
        }
    })
})

let getNewGameCode = () => {
    let gen = () => {
        let alp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let s = ''
        for (let i = 0; i < 6; i++) {
            let char = alp.charAt(Math.floor(Math.random() * alp.length))
            s += char
        }
        return s
    }

    let gc = gen()
    while (games.has(gc)) gc = gen()
    return gc
}

app.use(express.static('client/build'))

server.listen(5500, () => {
    console.log("server listening")
})
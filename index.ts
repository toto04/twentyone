import express from 'express'
import { createServer } from 'http'
import { Game, GameState } from './game'
import WebSocket from 'ws'

const app = express()
const server = createServer(app)
const wss = new WebSocket.Server({ server })

app.use(express.json())

let game: Game | undefined

interface GameMessage<T = any> {
    command: string
    info?: {
        id: number
    }
    data: T
}

let updateGameState = () => {
    gamers.forEach((ws, i) => {
        let update: GameMessage = {
            command: 'update',
            data: game?.getGameState(i)
        }
        ws.send(JSON.stringify(update))
    })
}

let sendMessage = (message: string, inverse?: boolean) => {
    if (!game) return
    let msg: GameMessage = {
        command: 'message',
        data: {
            message
        }
    }
    gamers[inverse ? (game.turn ? 0 : 1) : game.turn].send(JSON.stringify(msg))
}

let gamers: WebSocket[] = []

wss.on('connection', ws => {
    ws.on('message', msg => {
        let message: GameMessage = JSON.parse(msg.toString())
        let { command, info } = message

        switch (command) {
            case 'newgame':
                game = new Game()
                gamers[0] = ws
                console.log('created new game, waiting for other to join')
                break

            case 'connect':
                if (game) {
                    gamers[1] = ws
                    game.start()
                    updateGameState()
                    console.log('starting!11')
                }
                break

            case 'hit':
                if (!game || info?.id !== game.turn) break
                console.log(`player ${info.id} played hit`)
                game.giveCard()
                sendMessage('L\'avversario ha pescato una carta! È il tuo turno')
                updateGameState()
                break

            case 'stand':
                if (!game || info?.id !== game.turn) break
                console.log(`player ${info.id} played stand`)
                game.stand()
                sendMessage('L\'avversario ha passato! È il tuo turno')
                updateGameState()
                break

            case 'trump':
                if (!game || info?.id !== game.turn) break
                let { slot } = message.data
                console.log(`player ${info.id} played trump (slot ${slot})`)
                let t = game.useTrumpCard(slot)
                sendMessage(`L'avversario ha usato la carta ${t}`, true)
                updateGameState()
                break
        }
    })
})

app.use(express.static('client/build'))

server.listen(5500, () => {
    console.log("server listening")
})
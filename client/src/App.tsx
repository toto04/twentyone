import React, { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import './App.scss'
import { TrumpDeck, GameState, GameMessage } from 'typedefs'

let playerId: number
let ws = new WebSocket(`ws://${window.location.hostname}:5500`)
let sendCommand: (command: string, data?: any) => void

function Button(props: { text?: string, onClick: () => void, disabled?: boolean, id?: string }) {
    return <div
        className={"button" + (props.disabled ? ' disabled' : '')}
        id={props.id}
        onClick={() => (props.disabled ? undefined : props.onClick())}
    >
        {props.text}
    </div>
}

function App() {
    let [gameState, setGamestate] = useState<GameState>()
    let [gameMessage, setGameMessage] = useState<string>()
    let [waiting, setWaiting] = useState(false)
    let [gameCode, setGameCode] = useState('')
    let [inviteURL, setInviteURL] = useState('')

    useEffect(() => {
        if (playerId === 1) sendCommand('connect')
    }, [gameCode])

    useEffect(() => {
        let gc = window.location.href.match(new RegExp(`${window.location.origin}/play/((?:[A-Z]|[a-z]){6})`))?.[1]
        if (gc) {
            playerId = 1
            setGameCode(gc)
            setWaiting(true)
        }

        ws.addEventListener('message', ev => {
            let message: GameMessage = JSON.parse(ev.data)
            let { command, info, data } = message
            let msgTimeout: any
            switch (command) {
                case 'invite':
                    setInviteURL(data.inviteURL)
                    setGameCode(info.gameCode ?? '')
                    break

                case 'update':
                    setGamestate(data)
                    setWaiting(false)
                    setInviteURL('')
                    break

                case 'message':
                    clearTimeout(msgTimeout)
                    setGameMessage(data.message)
                    msgTimeout = setTimeout(() => {
                        setGameMessage(undefined)
                    }, 4000)
                    break
            }
        })
    }, [])

    sendCommand = (command: string, data?: any) => {
        let msg: GameMessage = {
            command,
            info: {
                gameCode,
                id: playerId
            },
            data
        }
        if (ws.readyState === ws.OPEN)
            ws.send(JSON.stringify(msg))
        ws.addEventListener('open', () => {
            ws.send(JSON.stringify(msg))
        })
    }

    // GAME BOARD
    if (gameState?.playing) return <div className="App">
        {gameMessage
            ? <div className="message">
                <p>{gameMessage}</p>
            </div>
            : undefined
        }
        <GameBoard gameState={gameState} />
    </div>

    // END GAME
    if (gameState?.winner !== undefined) {
        return <div className="App">
            <p>opp cards: {gameState.table[gameState.id ? 0 : 1].join(', ')} ({gameState.points![gameState.id ? 0 : 1]})</p>
            <p>your cards: {gameState.table[gameState.id].join(', ')} ({gameState.points![gameState.id]})</p>
            <h1>
                {gameState.winner === gameState.id ? "YOU WON!" : "YOU LOST :("}
            </h1>
        </div>
    }

    // INVITATION
    if (inviteURL) return <div className="App">
        <h2 className="invite-url">{inviteURL}</h2>
        <button className="copy" onClick={() => {
            navigator.clipboard.writeText(inviteURL)
        }}>copy</button>
        <h1>Waiting for others to join...</h1>
    </div>

    if (waiting) return <div className="App">
        <h1>waiting...</h1>
    </div>

    return <div className="App">
        <Button text="new game" onClick={() => {
            playerId = 0
            sendCommand('newgame')
        }} />
        {/* <Button text="play" onClick={async () => {
            
            setWaiting(true)
            sendCommand('connect')
        }} /> */}
    </div>
}

function GameBoard(props: { gameState: GameState }) {
    let [trumpView, setTrumpView] = useState(false)

    let oppCards: JSX.Element[] = []
    let youCards: JSX.Element[] = []
    for (let i = 0; i < 7; i++) {
        oppCards.push(<Card
            number={props.gameState.table[props.gameState.id ? 0 : 1][i]}
            key={`card${i}opp`}
        />)
    }
    for (let i = 0; i < 7; i++) {
        youCards.push(<Card
            number={props.gameState.table[props.gameState.id][i]}
            key={`card${i}you`}
        />)
    }

    return <div className="board">
        <div id="side">
            <div className="score">
                <img className="bet_opp" src={`/images/textures/bet/bet${(props.gameState.bets[playerId ? 0 : 1] + '').padStart(2, '0')}.png`} alt="bet_opp" />
                <img className="lives_opp" src={`/images/textures/lives/lives${10 - props.gameState.lives[playerId ? 0 : 1]}.png`} alt="lives_opp" />
                <img className="bet_you" src={`/images/textures/bet/bet${(props.gameState.bets[playerId] + '').padStart(2, '0')}.png`} alt="bet_you" />
                <img className="lives_you" src={`/images/textures/lives/lives${10 - props.gameState.lives[playerId]}.png`} alt="lives_you" />
            </div>
        </div>

        <div className="opp">
            <p className="total">totale: ? + {props.gameState.table[playerId ? 0 : 1].reduce((s, c) => s + c, 0)}</p>
            <div className="table">
                {oppCards}
            </div>
            <div className="trumptable">

            </div>
        </div>
        <img src="/images/textures/line.png" alt="" className="line" />
        <div className="you">
            <div className="trumptable">

            </div>
            <div className="table">
                {youCards}
            </div>
            <p className="total">totale: {props.gameState.table[playerId].reduce((s, c) => s + c, 0)}</p>
        </div>

        {trumpView
            ? <TrumpBox
                disabled={props.gameState.turn !== props.gameState.id}
                deck={props.gameState.trumpDeck}
                onPlay={slot => {
                    sendCommand('trump', { slot })
                }}
            />
            : undefined
        }

        <div className="button_container">
            <Button id="show_trump" onClick={async () => {
                setTrumpView(!trumpView)
            }} />
            <Button disabled={props.gameState.turn !== props.gameState.id} id="hit" onClick={async () => {
                sendCommand('hit')
            }} />
            <Button disabled={props.gameState.turn !== props.gameState.id} id="stand" onClick={async () => {
                sendCommand('stand')
            }} />
        </div>
    </div>
}

function Card(props: { number?: number }) {
    return <div className="card">
        {props.number !== undefined ? <img className="frame" src={`/images/numbers/${props.number}.png`} alt="" /> : undefined}
    </div>
}

function TrumpBox(props: { deck: TrumpDeck, disabled: boolean, onPlay: (slot: number) => void }) {

    return <div className="trump_box">
        <ReactTooltip
            place="bottom"
            effect="solid"
            getContent={dataTip => {
                let idx = parseInt(dataTip)
                return <div>
                    <h2>{props.deck[idx]?.name}</h2>
                    <p>{props.deck[idx]?.description}</p>
                </div>
            }}
        />
        <div className="trump_cards_container">
            {props.deck.map((trumpCard, i) => <img
                data-tip={i}
                className={"trump_card" + (props.disabled ? ' disabled' : '')}
                key={"trump_card_" + i}
                onClick={() => {
                    if (!props.disabled) { props.onPlay(i) }
                }}
                alt={trumpCard.name}
                src={`/images/trump_cards/${trumpCard.path}.png`}
            />)}
        </div>
        <img style={{ width: '100%' }} src="/images/textures/trump_box.png" alt="trump_box" />
    </div>
}

export default App

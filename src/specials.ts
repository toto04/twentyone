import { TrumpCard, TrumpCardC } from 'typedefs'
import { Game } from './game'
export type Effect = (game: Game, playerID: number) => boolean

let trumpPool = [
    '2_card',
    '3_card',
    '4_card',
    '5_card',
    '6_card',
    '7_card',
    'destroy_plus',
    'destroy_plus_plus',
    'exchange',
    'go_for_17',
    'go_for_24',
    'go_for_27',
    'love_your_enemy',
    'perfect_draw',
    'perfect_draw_plus',
    'return',
    'shield_plus',
    'trump_switch',
    'two_up',
    'two_up_plus',
]

export let drawSpecialCard = () => {
    let idx = Math.floor(Math.random() * trumpPool.length)
    let cardKey = trumpPool[idx]
    return getCard(cardKey)
}

export let getCard: (key: string) => TrumpCard = (key) => {
    let card = specialCards.get(key)
    if (!card) throw new Error('Tommaso sei un coglione e non sai scrivere, ' + key + 'non è una carta')
    return {
        ...card,
        path: key
    }
}

export let specialCards = new Map<string, TrumpCardC>([
    ['2_card', {
        name: 'Carta 2',
        effect: (game: Game, playerID: number) => {
            let idx = game.deck.indexOf(2)
            if (idx === -1) return false
            else {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
        },
        description: 'Pesca la carta 2. Se la carta non è nel mazzo non ha effetto.'
    }],
    ['3_card', {
        name: 'Carta 3',
        effect: (game: Game, playerID: number) => {
            let idx = game.deck.indexOf(3)
            if (idx === -1) return false
            else {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
        },
        description: 'Pesca la carta 3. Se la carta non è nel mazzo non ha effetto.'
    }],
    ['4_card', {
        name: 'Carta 4',
        effect: (game: Game, playerID: number) => {
            let idx = game.deck.indexOf(4)
            if (idx === -1) return false
            else {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
        },
        description: 'Pesca la carta 4. Se la carta non è nel mazzo non ha effetto.'
    }],
    ['5_card', {
        name: 'Carta 5',
        effect: (game: Game, playerID: number) => {
            let idx = game.deck.indexOf(5)
            if (idx === -1) return false
            else {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
        },
        description: 'Pesca la carta 5. Se la carta non è nel mazzo non ha effetto.'
    }],
    ['6_card', {
        name: 'Carta 6',
        effect: (game: Game, playerID: number) => {
            let idx = game.deck.indexOf(6)
            if (idx === -1) return false
            else {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
        },
        description: 'Pesca la carta 6. Se la carta non è nel mazzo non ha effetto.'
    }],
    ['7_card', {
        name: 'Carta 7',
        effect: (game: Game, playerID: number) => {
            let idx = game.deck.indexOf(7)
            if (idx === -1) return false
            else {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
        },
        description: 'Pesca la carta 7. Se la carta non è nel mazzo non ha effetto.'
    }],
    ['destroy_plus', {
        name: 'Distruggi +',
        effect: (game: Game, playerID: number) => {
            game.trumpTable[playerID ? 0 : 1] = []
            return true
        },
        description: 'Distrugge tutte le trump cards dell\'avversario.'
    }],
    ['destroy_plus_plus', {
        name: 'Distruggi ++',
        effect: (game: Game, playerID: number) => {
            game.trumpTable[playerID ? 0 : 1] = []
            game.trumpTable[playerID].push(getCard('destroy_plus_plus'))
            return true
        },
        description: 'Distrugge tutte le trump cards dell\'avversario. Mentre questa carta è sul tavolo l\'avversario non può giocare trump cards.'
    }],
    ['exchange', {
        name: 'Scambia',
        effect: (game: Game, playerID: number) => {
            let tmp = game.table[0][game.table[0].length - 1]
            game.table[0][game.table[0].length - 1] = game.table[1][game.table[1].length - 1]
            game.table[1][game.table[1].length - 1] = tmp
            return true
        },
        description: 'Scambia le ultime carte pescate di entrambi i giocatori'
    }],
    ['go_for_17', {
        name: 'Go for 17',
        effect: (game: Game, playerID: number) => {
            removeGoForCards(game)
            game.trumpTable[playerID].push(getCard('go_for_17'))
            game.currentTarget = 17
            return true
        },
        description: 'Vince chi si avvicina di più a 17. Rimpiazza le altre "Go for …" presenti sul tavolo.'
    }],
    ['go_for_24', {
        name: 'Go for 24',
        effect: (game: Game, playerID: number) => {
            removeGoForCards(game)
            game.trumpTable[playerID].push(getCard('go_for_24'))
            game.currentTarget = 24
            return true
        },
        description: 'Vince chi si avvicina di più a 24. Rimpiazza le altre "Go for …" presenti sul tavolo.'
    }],
    ['go_for_27', {
        name: 'Go for 27',
        effect: (game: Game, playerID: number) => {
            removeGoForCards(game)
            game.trumpTable[playerID].push(getCard('go_for_27'))
            game.currentTarget = 27
            return true
        },
        description: 'Vince chi si avvicina di più a 27. Rimpiazza le altre "Go for …" presenti sul tavolo.'
    }],
    ['love_your_enemy', {
        name: 'Ama il tuo nemico',
        effect: (game: Game, playerID: number) => {
            let idx = getBestCard(game, playerID ? 0 : 1)
            if (idx !== undefined) {
                game.table[playerID ? 0 : 1].push(game.deck.splice(idx, 1)[0])
                return true
            }
            else
                return false
        },
        description: 'Fa pescare la carta migliore possibile al tuo avversario'
    }],
    ['perfect_draw', {
        name: 'Pesca perfetta',
        effect: (game: Game, playerID: number) => {
            game.trumpDecks[playerID].push(drawSpecialCard())
            let idx = getBestCard(game, playerID)
            if (idx !== undefined) {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
            else
                return false
        },
        description: 'Ti fa pescare la carta migliore possibile. Pesca una trump card aggiuntiva'
    }],
    ['perfect_draw_plus', {
        name: 'Pesca perfetta +',
        effect: (game: Game, playerID: number) => {
            game.trumpTable[playerID].push(getCard('perfect_draw_plus'))
            updateAllBets(game)
            let idx = getBestCard(game, playerID)
            if (idx !== undefined) {
                game.table[playerID].push(game.deck.splice(idx, 1)[0])
                return true
            }
            else
                return false
        },
        description: 'Ti fa pescare la carta migliore possibile e aumenta la puntata dell\'avversario di 5'
    }],
    ['return', {
        name: 'Restituisci',
        effect: (game: Game, playerID: number) => {
            let card = game.table[playerID].pop()
            if (!card) return false
            game.deck.splice(Math.floor(Math.random() * game.deck.length), 0, card)
            return true
        },
        description: 'Rimette nel mazzo l\'ultima carta da te pescata'
    }],
    ['shield_plus', {
        name: 'Scudo +',
        effect: (game: Game, playerID: number) => {
            game.trumpTable[playerID].push(getCard('shield_plus'))
            updateAllBets(game)
            return true
        },
        description: 'Riduce di due la tua puntata di 2'
    }],
    ['trump_switch', {
        name: 'Trump switch',
        effect: (game: Game, playerID: number) => {
            if (game.trumpDecks[playerID].length < 2) return false
            // Randomly remove 2 cards from the deck
            for (let i = 0; i < 2; i++) game.trumpDecks[playerID].splice(Math.floor(Math.random() * game.trumpDecks[playerID].length), 1)
            for (let i = 0; i < 3; i++) game.trumpDecks[playerID].push(drawSpecialCard())
            return true
        },
        description: 'Scarta due trump cards a caso dal tuo mazzo e pescane altre tre'
    }],
    ['two_up', {
        name: 'Two up',
        effect: (game: Game, playerID: number) => {
            game.trumpTable[playerID].push(getCard('two_up'))
            updateAllBets(game)
            game.trumpDecks[playerID].push(drawSpecialCard())
        },
        description: 'Aumenta di 2 la puntata dell\'avversario. Pesca una trump card aggiuntiva'
    }],
    ['two_up_plus', {
        name: 'Two up +',
        effect: (game: Game, playerID: number) => {
            game.trumpTable[playerID].push(getCard('two_up_plus'))
            updateAllBets(game)
            game.table[playerID ? 0 : 1].pop()
        },
        description: 'Aumenta di 2 la puntata dell\'avversario. Rimette nel mazzo l\'ultima carta pescata dall\'avversario'
    }],
])

function updateAllBets(game: Game) {
    for (let i = 0; i <= 1; i++) {
        let bets = game.trumpTable[i].reduce((s, tc) => {
            if (
                tc.name === getCard('two_up').name ||
                tc.name === getCard('two_up_plus').name
            ) return s + 2

            if (tc.name === getCard('perfect_draw_plus').name) return s + 5
            return s
        }, 1)
        bets = game.trumpTable[i ? 0 : 1].reduce((s, tc) => {
            if (tc.name === getCard('shield_plus').name) return s - 2
            return s
        }, bets)
        game.bets[i ? 0 : 1] = Math.min(Math.max(bets, 0), 10)
    }
}

function removeGoForCards(game: Game) {
    for (let i = 0; i <= 1; i++) {
        let idx = game.trumpTable[i].findIndex(c =>
            c.name === getCard('go_for_17').name ||
            c.name === getCard('go_for_24').name ||
            c.name === getCard('go_for_27').name
        )
        if (idx !== -1) game.trumpTable[i].splice(idx, 1)
    }
}

let getBestCard: (game: Game, playerID: number) => number | undefined = (game, playerID) => {
    let sum = game.table[playerID].reduce((s, c) => s + c, 0)
    let target = game.currentTarget - sum
    let idx = game.deck.indexOf(target)
    while (idx === -1 && target > 0) {
        target--
        idx = game.deck.indexOf(target)
    }
    return idx !== -1 ? idx : undefined
}
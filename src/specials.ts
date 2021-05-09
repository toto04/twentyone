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
    'love_your_enemy',
]

export let drawSpecialCard = () => {
    let idx = Math.floor(Math.random() * trumpPool.length)
    let cardKey = trumpPool[idx]
    return getCard(cardKey)
}

export let getCard: (key: string) => TrumpCard = (key) => {
    let card = specialCards.get(key)
    if (!card) throw new Error('Tommaso sei un coglione e non sai scrivere')
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
        name: 'Carta 57',
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
        description: 'Distrugge tutte le trump cards dell\'avversario.'
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
    ['love_your_enemy', {
        name: 'Ama il tuo nemico',
        effect: (game: Game, playerID: number) => {
            let idx = getBestCard(game, playerID ? 0 : 1)
            if (idx !== undefined) {
                game.table.push(game.deck.splice(idx, 1))
                return true
            }
            else
                return false
        },
        description: 'Fa pescare la carta migliore possibile al tuo avversario'
    }],
])

let getBestCard: (game: Game, playerID: number) => number | undefined = (game, playerID) => {
    let sum = game.table[playerID].reduce((s, c) => s + c, 0)
    let target = game.currentTarget - sum
    let idx = game.deck.indexOf(target)
    while (idx === -1 && target > 0) {
        target--
        idx = game.deck.indexOf(target)
    }
    return idx !== -1 ? target : undefined
}
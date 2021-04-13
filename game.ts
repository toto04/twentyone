import { drawSpecialCard, TrumpCard } from './specials'

export type Deck = number[]
export type TrumpDeck = TrumpCard[]
export type TrumpTable = [TrumpDeck, TrumpDeck]
export type Table = [Deck, Deck]

export interface GameState {
    playing: boolean
    winner?: number
    points?: [number, number]
    id: number
    bets: [number, number]
    lives: [number, number]
    table: Table
    trumpTable: TrumpTable
    trumpDeck: TrumpDeck
    turn: number
}

const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export class Game {
    playing: boolean = false
    winner?: number
    points?: [number, number]
    bets: [number, number] = [1, 1]
    lives: [number, number] = [10, 10]
    stood: [boolean, boolean] = [false, false]
    turn: number = 0
    currentTarget = 21

    deck: Deck = []
    table: Table = [[], []]

    trumpDecks: TrumpTable = [[], []]
    trumpTable: TrumpTable = [[], []]

    constructor() {
        // initialize trump decks on startup
        for (let i = 0; i < 4; i++) {
            this.trumpDecks[0].push(drawSpecialCard())
            this.trumpDecks[1].push(drawSpecialCard())
        }
    }

    initializeTable = () => {
        this.stood = [false, false]
        this.bets = [1, 1]

        this.deck = shuffle([...card])
        this.table = [[], []]

        this.table[0].push(this.deck.pop()!)
        this.table[0].push(this.deck.pop()!)
        this.table[1].push(this.deck.pop()!)
        this.table[1].push(this.deck.pop()!)
    }

    start = () => {
        this.initializeTable()
        this.playing = true
    }

    useTrumpCard = (n: number) => {
        let card = this.trumpDecks[this.turn].splice(n, 1)[0]
        card.effect(this, this.turn)
        return card.name
    }

    giveCard = () => {
        this.table[this.turn].push(this.deck.pop()!)
        this.turn = this.turn ? 0 : 1
        this.stood = [false, false]
    }

    stand = () => {
        this.stood[this.turn] = true
        this.turn = this.turn ? 0 : 1

        if (this.stood[0] && this.stood[1]) {
            let l = this.getWinner() ? 0 : 1
            this.lives[l] -= this.bets[l]
            this.turn = l
            this.initializeTable()

            return true
        }
        return false
    }

    getWinner = (): number => {
        let points: [number, number] = [
            this.table[0].reduce((s, c) => s += c, 0),
            this.table[1].reduce((s, c) => s += c, 0)
        ]
        this.points = points

        if (points[0] == points[1])
            return -1
        else if (points[0] <= 21 && points[1] <= 21)
            return points[0] > points[1] ? 0 : 1
        else
            return points[0] < points[1] ? 0 : 1

    }

    getGameState = (filter: number): GameState => {
        let t: Table = [[...this.table[0]], [...this.table[1]]]
        if (this.playing) t[filter ? 0 : 1][0] = 0

        return {
            playing: this.playing,
            winner: this.winner,
            points: this.points,
            id: filter,
            bets: this.bets,
            lives: this.lives,
            table: t,
            trumpDeck: this.trumpDecks[filter],
            trumpTable: this.trumpTable,
            turn: this.turn
        }
    }
}

function shuffle(array: number[]) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
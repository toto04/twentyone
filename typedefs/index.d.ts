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

export interface TrumpCardC {
    name: string
    effect: Effect
    description: string
}

export type TrumpCard = TrumpCardC & {
    path: string
}

export interface GameMessage<T = any> {
    command: string
    info: {
        gameCode?: string
        id?: number
    }
    data: T
}
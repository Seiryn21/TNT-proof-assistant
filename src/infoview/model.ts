export interface IPosition {
    line : number,
    character : number
}

export interface IRange {
    start : IPosition,
    end : IPosition
}

export interface ILine {
    range : IRange,
    display : string,
    empty : Boolean
}

export interface ITheorem {
    range : IRange,
    lines : ILine[]
}
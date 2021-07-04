import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ILine, IPosition, ITheorem } from './model';
import { PositionEvent, UpdateEvent } from './server';

import './style.css';

function posSuperior(p1 : IPosition, p2 : IPosition)
{
    return p2.line > p1.line || (p1.line == p2.line && p2.character > p1.character);
}

function posInferior(p1 : IPosition, p2 : IPosition)
{
    return p2.line < p1.line || (p1.line == p2.line && p2.character <= p1.character);
}

function getTheorem(theorems : ITheorem[], pos : IPosition)
{
    for(var i=0; i < theorems.length; i++)
    {
        let theorem = theorems[i];
        if(posSuperior(theorem.range.start, pos) && posInferior(theorem.range.end, pos))
        {
            return theorem;
        }
    }
    return undefined;
}

function Line(props : {line : ILine, index : number, pos : IPosition})
{
    var selected : boolean;
    if(props.line.range !== null)
        selected = posSuperior(props.line.range.start, props.pos) && posInferior(props.line.range.end, props.pos)
    else
        selected = false;
    var key = props.index.toString() + (selected ? "_selected" : "")
    var className = "line";
    if(selected)
        className += " selected"
    return <div key={key} className={className}>{props.line.display}</div>
}

function Theorem(props: { theorem: ITheorem, pos : IPosition})
{
    
    if(props.theorem)
    {
        const lines = props.theorem.lines.filter((line : ILine, index: number) => !line.empty).map((line : ILine, index: number) => <Line line={line} index={index} pos={props.pos}/>);
        return <div>{lines}</div>
    }
    return null
}

function App ()
{
    var basePos : IPosition = {line:0, character:0};
    const [theorems, setTheorems] = React.useState([]);
    const [pos, setPos] = React.useState(basePos);
    UpdateEvent.on((data: React.SetStateAction<any[]>) => {
        setTheorems(data)
    })
    PositionEvent.on((data: React.SetStateAction<any>) => {
        setPos(data)
    })
    return <Theorem theorem={getTheorem(theorems, pos)} pos={pos}/>
}

ReactDOM.render(<App/>, document.getElementById('root'));
import React from "react";

const Title = (props:{
    xPos:number,
    yPos:number,
    text:string
}) => {
    return (
        <text
            x={props.xPos}
            y={props.yPos}
            textAnchor={"middle"}
            fontSize={"2em"}
        >
            {props.text}
        </text>);
};

export default Title;
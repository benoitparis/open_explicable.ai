import {ScaleLinear, ScaleOrdinal} from "d3";
import React, {PropsWithChildren} from "react";
import {chartable} from "./AttributionPlot";

const Tooltip = (props:PropsWithChildren<{
    position: {xPos:number, yPos:number},
}>) => {
    return (<div
        className={"tooltip"}
        style={{
            position: "absolute",
            textAlign: "center",
            opacity: 0.9, // TODO animate
            zIndex: 10,
            padding: "10px",
            background: "black",
            color: "white",
            border: "0",
            borderRadius: "8px",
            pointerEvents: "none",
            left: `${props.position.xPos-40}px`,
            top: `${props.position.yPos-40}px`,
        }}
    >
        {props.children}
    </div>);
};

export default Tooltip;
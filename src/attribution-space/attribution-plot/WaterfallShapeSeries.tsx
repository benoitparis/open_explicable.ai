import {ScaleLinear, ScaleOrdinal} from "d3";
import React from "react";
import {chartable} from "./AttributionPlot";

const WaterfallShapeSeries = (props:{
    data: chartable[],
    barHeight: number,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleOrdinal<string, number>,
    handleMouseOver: (event:any, d:chartable) => void,
    handleMouseOut: (event:any, d:chartable) => void,
}) => {

    // TODO these rects arrows
    // <g transform="scale(100, 20)">
    //     <g transform="scale(0.1, 0.5)">
    //         <path d="M 0 0 L 9 0 L 10 1 L 9 2 L 0 2 Z"/>
    //     </g>
    // </g>
    // <g transform="scale(100, 20) translate(1, 0) scale(-1, 1)">
    //     <g transform="scale(0.1, 0.5)">
    //         <path d="M 0 0 L 9 0 L 10 1 L 9 2 L 0 2 Z"/>
    //     </g>
    // </g>

    const shape = (d:chartable) =>
        <rect
            fill={d.fill}
            transform={`translate(0, ${(props.yScale(d.name)-props.barHeight/2)})`}
            shapeRendering={"crispedges"}
            x={props.xScale(Math.min(d.start, d.end))}
            width={Math.abs(props.xScale(d.start) - props.xScale(d.end))}
            height={props.barHeight}
            onMouseOver={(e) => props.handleMouseOver(e, d)}
            onClick={(e) => props.handleMouseOver(e, d)}
            onMouseOut={(e) => props.handleMouseOut(e, d)}
        />
    return (<g>{props.data.map(shape)}</g>);
};

export default WaterfallShapeSeries;
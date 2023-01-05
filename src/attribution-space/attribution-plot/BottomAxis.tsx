import {axisBottom, ScaleLinear, select} from "d3";
import React, {useEffect, useRef} from "react";

// TODO linker les types domain (entre scale et tickformat par ex)
const BottomAxis = (props:{
    scale: ScaleLinear<number, number>,
    xPos:number,
    yPos:number,
    tickFormat:(domainValue: number, index: number) => string
}) => {
    const ref = useRef<SVGSVGElement>(null);
    useEffect(() => {
        const axisGenerator = axisBottom<number>(props.scale).tickFormat(props.tickFormat);

        const host = select(ref.current);
        host.select("g").remove();
        const group = host.append("g");
        group.call(axisGenerator);

        //TODO how to do react style?
        group
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "translate(0, 20) rotate(90) translate(0, -16)")
            .attr("font-size", "1.5em")

    }, [props.scale]);

    return (
        <g
            ref={ref}
            className={"x axis"}
            transform={`translate(${props.xPos}, ${props.yPos})`}
        />);
};

export default BottomAxis;
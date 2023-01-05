import {axisLeft, ScaleOrdinal, select} from "d3";
import React, {useEffect, useRef} from "react";

// TODO linker les types domain (entre scale et tickformat par ex)
const BottomAxis = (props:{
    scale: ScaleOrdinal<string, number>,
    xPos:number,
    yPos:number
}) => {
    const ref = useRef<SVGSVGElement>(null);
    useEffect(() => {
        const axisGenerator = axisLeft<string>(props.scale);

        const host = select(ref.current);
        host.select("g").remove();
        const group = host.append("g");
        group.call(axisGenerator);

        //TODO how to do react style?
        group
            .selectAll("text") // TODO mettre la valeur dans le texte de l'axe aussi
            .style("text-anchor", "end")
            .attr("transform", "translate(-10, 0) rotate(-20)")
            .attr("font-size", "1.5em")

    }, [props.scale]);

    return (
        <g
            ref={ref}
            className={"y axis"}
            transform={`translate(${props.xPos}, ${props.yPos})`}
        />);
};

export default BottomAxis;
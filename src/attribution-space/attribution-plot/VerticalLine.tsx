import React from "react";

const VerticalLine = (props:{
    xPos:number,
    yPos1:number,
    yPos2:number,
    yPosText:number,
    textAnchor:string,
    text:string
}) => {
    // chart
    //     .append("line")
    //     .style("stroke", "black")
    //     .style("stroke-dasharray", "3")
    //     .attr("x1", xScale(mean))
    //     .attr("y1", -margin*3/4)
    //     .attr("x2", xScale(mean) )
    //     .attr("y2", ad.length * barHeight)
    // ;
    // chart.append("text")
    //     .attr("x", xScale(mean))
    //     .attr("y", -margin)
    //     .attr("text-anchor", mean > total ? "end" : "start")
    //     .attr("font-size", "1em")
    //     .text("mean: " + numberFormatterAbsolute.format(mean))
    // ;
    // chart
    //     .append("line")
    //     .style("stroke", "black")
    //     .style("stroke-dasharray", "3")
    //     .attr("x1", xScale(total))
    //     .attr("y1", -margin*1/4)
    //     .attr("x2", xScale(total) )
    //     .attr("y2", ad.length * barHeight)
    // ;
    // chart.append("text")
    //     .attr("x", xScale(total))
    //     .attr("y", -margin/2)
    //     .attr("text-anchor", total > mean? "end" : "start")
    //     .attr("font-size", "1em")
    //     .text("end value: " + numberFormatterAbsolute.format(total))
    // ;


    return (
        <>
            <line
                style={{stroke: "black", strokeDasharray: "3"}}
                x1={props.xPos}
                y1={props.yPos1}
                x2={props.xPos}
                y2={props.yPos2}
            />
            <text
                x={props.xPos}
                y={props.yPosText}
                textAnchor={props.textAnchor}
                fontSize={"1em"}
            >
                {props.text}
            </text>
        </>
    );
};

export default VerticalLine;
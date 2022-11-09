import React from 'react';
import Plot from 'react-plotly.js';
import {DataConfiguration, DataSet} from "./DataManagement";
import * as d3 from "d3";


const AttributionPlot = (props:{
        selected: number,
        configuration: DataConfiguration|null,
        dataset: DataSet<any>|null,
        shapValues: DataSet<any>|null,
    }) => {

    const featureNames = [
        // "Mean",
        ... (props.dataset
            ? props.dataset.metadata.schema.map(it => it.name)
            : []
        )
    ];
    const attributionObj = props.shapValues?.data[props.selected];
    const attributionValues = [
        // props.configuration["mean"],
        ...featureNames.map(it => {
            return attributionObj["attribution_" + it];
        })
    ]

    const plot =
        <Plot
            data={[
                {
                    name: "Attributions",
                    type: "waterfall",
                    orientation: "h",
                    y: featureNames,
                    x: attributionValues,
                    textposition: "outside",
                }
            ]}
            layout={{
                title: {text: "Attributions"},
                yaxis: {type: "category"},
                xaxis: {type: "linear"}
            }}
            style={{
                borderRadius: "17px",
                borderWidth: "6px",
                borderColor: "skyblue",
                borderStyle: "dashed",
            }}
            config={{
                displaylogo: false,
                setBackground: "transparent"
            }}
        />

    const loading =
        <div style={{
            position: "absolute",
            background: "white",
            height: "25em",
            width: "25em",
            zIndex: 4,
        }}>
            <div style={{
                margin: "2em",
            }}>
                <pre>Data:</pre>
                <pre>{"Configuration " + (props.configuration? "OK" : "Loading...")}</pre>
                <pre>{"Dataset       " + (props.dataset      ? "OK" : "Loading...")}</pre>
                <pre>{"Attributions  " + (props.shapValues   ? "OK" : "Loading...")}</pre>
            </div>
        </div>

    console.log(props.selected)
    console.log(attributionValues)

    const plot2 = <AttributionsWaterfallPlot

     configuration={props.configuration} dataset={props.dataset} selected={props.selected} shapValues={props.shapValues}/>

    return (
        <div style={{
            position:"absolute",
            top: "5em",
            left: "1em",
            zIndex: 4,
        }}>
            {
                // !(props.configuration && props.dataset && props.shapValues)?
                false?
                loading : plot2
            }
        </div>
    );

}
type base = {name:string, value:number};
const data:base[] = [
        {name:"List Price","value":100},
        {name:"County Adj","value":-13},
        {name:"Country List Price","value":-20},
        // {name:"Subtotal","value":sub_cumulative},
        {name:"Std Discount","value":-20},
        {name:"Promotion","value":7},
        {name:"Volume Discount","value":-10},
        {name:"Freight Surcharge","value":6},
        {name:"Sales Discount","value":5},
        {name:"Invoice Price","value":9},
        {name:"Cash Discount","value":-2},
        {name:"Customer Rebate","value":-14},
        {name:"Buying Group Rebate","value":4},
        {name:"Net Price","value":-12},
        {name:"Bonus","value":13},
        {name:"Cost to Serve","value":-9},
        {name:"Pocket Price","value":-12},
        {name:"Production Cost","value":-12},
        {name:"Net Margin","value":-14}
    ];
type cumulative = {
    start:number,
    end:number,
    fill:"blue"|"red",
}
type chartable = (base & cumulative)
const accumulatedData = ():chartable[] => {
    let cumulative = 0;
    return data.map(it => {
        const before = cumulative;
        cumulative += it.value;
        return {
            name: it.name,
            value: it.value,
            start: before,
            end: cumulative,
            fill: it.value > 0? "blue" : "red"
        }
    })
}
;

// const SIZE = 975;
export const AttributionsWaterfallPlot = (props:{
    selected: number|null,
    configuration: DataConfiguration|null,
    dataset: DataSet<any>|null,
    shapValues: DataSet<any>|null,
}) => {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = React.useState("0,0,0,0");

    const getAutoBox = () => {
        if (!svgRef.current) {
            return "";
        }
        console.log(svgRef.current.getBBox())
        const { x, y, width, height } = svgRef.current.getBBox();
        return [x, y, width, height].toString();
    };

    React.useLayoutEffect(() => {
        setViewBox(getAutoBox());
    }, []);

    const margin = {top: 20, right: 30, bottom: 100, left: 70},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    React.useLayoutEffect(() => {

        const ad = accumulatedData();
        console.log(ad)

        const x = d3.scaleOrdinal(
                ad.map(it => it.name),
                ad.map((it, idx) => idx * 25)
            );

        const y = d3.scaleLinear()
            .domain([0, Math.max(...ad.map(it => it.end))])
            .range([height, 0])
        ;

        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        const chart = d3.select(svgRef.current)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;


        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 6)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(50) translate(0," + (-10) + ")")
            .style("text-anchor", "start");

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        const bar = chart.selectAll(".bar")
            .data(ad)
            .enter()
            .append("g")
            .attr("fill", d => d.fill)
            .attr("transform", d => "translate(" + x(d.name) + ",0)");

        bar.append("rect")
            .attr("y", d => y(Math.max(d.start, d.end)))
            .attr("height", d => Math.abs(y(d.start) - y(d.end)))
            .attr("width", 20)


// //tooltip
//         var tooltip = d3.select("body").append("div")
//             .attr("class", "tooltip")
//             .style("opacity", 0)
//             .attr("align","middle");

        // .attr("width", x.rangeBand())
        // function to draw the tooltip

            // .on("mouseover", function(d) {
            //     // // to find the parent node,to calculate the x position
            //     // var parentG = d3.select(this.parentNode);
            //     // var barPos = parseFloat(parentG.attr('transform').split("(")[1]);
            //     // var xPosition = barPos+x.rangeBand()/2;
            //     // //to find the y position
            //     // var yPosition = parseFloat(d3.select(this).attr("y"))+ Math.abs( y(d.start) - y(d.end))/2;
            //     // tooltip.transition()
            //     //     .duration(200)
            //     //     .style("opacity", .9);
            //     // tooltip.html(d.name + "<br/>"  + (d.value) + "M")
            //     //     .style("left", xPosition + "px")
            //     //     .style("top",  yPosition + "px");
            // })
            // .on("mouseout", function(d) {
            //     // tooltip.transition()
            //     //     .duration(500)
            //     //     .style("opacity", 0);
            // });


        // bar
        //     // .filter(function(d) { return d.class != "total" })
        //     .append("line")
        //     .attr("class", "connector")
        //     // .attr("x1", x.rangeBand() + 5 )
        //     .attr("x1", 15 )
        //     .attr("y1", function(d:any) { return y(d.end) } )
        //     // .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
        //     .attr("x2", 10 )
        //     .attr("y2", function(d:any) { return y(d.end) } )

        chart.attr("viewBox", getAutoBox);

    });


    return (
        <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} viewBox={viewBox} ref={svgRef} style={{background:"white"}}>
        </svg>
    );

}

export default AttributionPlot;
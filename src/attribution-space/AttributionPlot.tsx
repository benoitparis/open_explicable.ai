import React from 'react';
import {DataConfiguration, DataSet} from "./DataManagement";
import * as d3 from "d3";

const AttributionPlot = (props:{
        selected: number,
        configuration: DataConfiguration|null,
        dataset: DataSet<any>|null,
        shapValues: DataSet<any>|null,
    }) => {

    const featureNames = props.dataset
            ? props.dataset.metadata.schema.map(it => it.name)
            : [];
    if (featureNames.length > 0) {
        featureNames.shift(); // first element is the parquet schema TODO filter upstream?
    }

    const dataObj = props.dataset?.data[props.selected];
    const dataValues = featureNames.map(it => {
            return dataObj[it];
        });
    const attributionObj = props.shapValues?.data[props.selected];
    const attributionValues = featureNames.map(it => {
            return attributionObj["attribution_" + it];
        })

    const loading =
        <div style={{
            margin: "2em",
        }}>
            <pre>Data:</pre>
            <pre>{"Configuration " + (props.configuration? "OK" : "Loading...")}</pre>
            <pre>{"Dataset       " + (props.dataset      ? "OK" : "Loading...")}</pre>
            <pre>{"Attributions  " + (props.shapValues   ? "OK" : "Loading...")}</pre>
        </div>

    console.log(props.selected)
    console.log(attributionValues)

    const plot =
        props.configuration?
        <AttributionsWaterfallPlot
            configuration={props.configuration}
            featureNames={featureNames}
            dataValues={dataValues}
            attributionValues={attributionValues}
        />
        :"";

    const hasLoaded = props.configuration && props.dataset && props.shapValues;

    // TODO abstract boxes?
    // TODO abstract a loading box?
    return (
        <div style={{
            position:"absolute",
            top: "6em",
            left: "1em",
            zIndex: 4,
        }}>

            <div
                style={{
                    background:"white",
                    opacity: 0.95,
                    borderRadius: "15px",
                    borderWidth: "5px",
                    borderColor: "grey",
                    borderStyle: "dashed",
                    transition: "all 2s ease-out",
                    minHeight: hasLoaded ? "300px" : "50px",
                    maxHeight: hasLoaded ? "1000px" : "200px",
                    minWidth: hasLoaded ? "500px" : "50px",
                    maxWidth: hasLoaded ? "800px" : "300px",
                    overflow: "hidden"
                }}>
                {
                    hasLoaded?
                    // true?
                    plot : loading
                }
            </div>
        </div>
    );

}
type base = {name:string, value:number};
type cumulative = {
    start:number,
    end:number,
    fill:"blue"|"red"|"orange"|"grey", // -, +, hovered, composite
}
type chartable = (base & cumulative)


// TODO coding convention: https://wattenberger.com/blog/react-and-d3
export const AttributionsWaterfallPlot = (props:{
    configuration: DataConfiguration,
    featureNames: string[],
    dataValues: number[],
    attributionValues: number[],
}) => {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = React.useState("0,0,0,0");

    const margin = 20;
    const screenHeight = 800;
    const minBarHeight = 14;
    const barHeight = Math.max(
        minBarHeight,
        (screenHeight + 4 * margin) / props.featureNames.length // 4 arbitrary, to account for left axis text space
    );
    const width = 600;
    const svgHeight = Math.max(
        screenHeight,
        minBarHeight * props.featureNames.length
    );

    const getAutoBox = () => {
        if (!svgRef.current) {
            return "";
        }
        console.log(svgRef.current.getBBox())
        const { x, y, width, height } = svgRef.current.getBBox();
        return [x - margin, y - margin, width + 2 * margin, height + 2 * margin].toString();
    };

    const accumulatedData = (data:base[]):chartable[] => {
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

    React.useEffect(() => {


        // console.log(props.featureNames)
        // console.log(props.attributionValues)

        const attributionData:base[] = props.featureNames
            .filter(it => it !== props.configuration["predicted_variables"][0])
            .map((d, i) => {
                return {
                        name: d,
                        value: props.attributionValues[i]
                }
        })

        // console.log(attributionData)

        const ad = accumulatedData(attributionData);
        // const ad = accumulatedData(exampleData);

        // console.log(ad)

        const yScale = d3.scaleOrdinal<number>()
            .domain([...ad.map(it => it.name), ""])
            .range([...ad.map((it, idx) => idx * barHeight), ad.length * barHeight])
        ;

        // TODO rework domain min max from whole dataset?
        const xScale = d3.scaleLinear()
            .domain([Math.min(...ad.map(it => it.start)), Math.max(...ad.map(it => it.end))])
            .range([0, width*(3/5)])
        ;

        const yAxis = d3.axisLeft(yScale);
        const xAxis = d3.axisBottom(xScale);

        const chart = d3.select(svgRef.current)
            .append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")")
        ;

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")
            .attr("transform", "translate(-10, 0) rotate(-20)")
            .attr("font-size", "1.5em")
            .style("text-anchor", "end")
        ;

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (ad.length) * barHeight + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "start")
            // TODO something dynamic with range?
            .attr("transform", "translate(0, 20) rotate(90) translate(0, -16)")
            .attr("font-size", "1.5em")
        ;

        const bar = chart.selectAll(".bar")
            .data(ad)
            .enter()
            .append("g")
            .attr("fill", d => d.fill)
            .attr("transform", d => "translate(0," + yScale(d.name) + ")")
        ;

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("align","middle")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("z-index", "10")
            .style("padding", "2px")
            .style("background", "black")
            .style("color", "white")
            .style("border", "0")
            .style("border-radius", "8px")
            .style("pointer-events", "none")
            .style("width", "120px")
        ;

        const numberFormatter = Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 2,
            signDisplay: "always"
        })

        bar.append("rect") // how to config hover?
            .attr("shape-rendering", "crispedges")
            .attr("x", d => xScale(Math.min(d.start, d.end)))
            .attr("transform", "translate(0, " + -barHeight/2 + ")")
            .attr("width", d => Math.abs(xScale(d.start) - xScale(d.end)))
            .attr("height", barHeight)
            .on("mouseover", (event, d) => {
                const xPosition = event.pageX - 40;
                const yPosition = event.pageY + 40;
                console.log(xPosition)
                console.log(yPosition)
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.name + "<br/>" +
                    (numberFormatter.format(d.value)) + "<br/>" +
                    "(Initial: " + (numberFormatter.format(d.start)) + ")"
                )
                    .style("left", xPosition + "px")
                    .style("top",  yPosition + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // TODO collapse small contiguous unimportant features
        // bar
        //     .append("line")
        //     .attr("class", "connector")
        //     // .attr("x1", x.rangeBand() + 5 )
        //     .attr("x1", 15 )
        //     .attr("y1", function(d:any) { return y(d.end) } )
        //     // .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
        //     .attr("x2", 10 )
        //     .attr("y2", function(d:any) { return y(d.end) } )

        setViewBox(getAutoBox());

        return(() => {
            // TODO full react? maybe not: we want
            chart.selectChildren().remove();
        })

    }, [props.featureNames, props.dataValues, props.attributionValues]);


    return (
        <div
            style={{
                // background:"white",
                // opacity: 0.95,
                // borderRadius: "15px",
                // borderWidth: "5px",
                // borderColor: "grey",
                // borderStyle: "dashed",
                maxHeight: screenHeight,
                overflow: "overlay",
                width: width + margin,
            }}>
            <svg
                ref={svgRef}
                width={width}
                height={svgHeight}
                viewBox={viewBox}>
            </svg>
        </div>
    );

}

export default AttributionPlot;
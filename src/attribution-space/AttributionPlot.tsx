import React from 'react';
import {DataConfiguration, DataPoint, DataSet} from "./DataManagement";
import * as d3 from "d3";

const AttributionPlot = (props:{
        selected: number,
        configuration: DataConfiguration|null,
        dataset: DataSet<any>|null,
        shapValues: DataSet<any>|null,
        points:DataSet<DataPoint>|null,
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
    const point:DataPoint|undefined = props.points?.data[props.selected];

    const loading =
        <div style={{
            margin: "2em",
        }}>
            <pre>Data:</pre>
            <pre>{"Configuration " + (props.configuration? "OK" : "Loading...")}</pre>
            <pre>{"Points        " + (props.points       ? "OK" : "Loading...")}</pre>
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
            point={point}
        />
        :"";

    const hasLoaded = props.configuration && props.dataset && props.shapValues && props.points;

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
type base = {
    name:string,
    attributionValue:number,
    dataValue:number,
};
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
    point:DataPoint|undefined,
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

    const accumulatedData = (mean: number, data:base[]):chartable[] => {
            let cumulative = mean;
            return data.map(it => {
                const before = cumulative;
                cumulative += it.attributionValue;
                return {
                    name: it.name,
                    attributionValue: it.attributionValue,
                    dataValue: it.dataValue,
                    start: before,
                    end: cumulative,
                    fill: it.attributionValue > 0? "red" : "blue"
                }
            })
        }
    ;

    React.useEffect(() => {

        // TODO verify data actually usable, maybe before creation?

        // console.log(props.featureNames)
        // console.log(props.attributionValues)

        const attributionData:base[] = props.featureNames
            .filter(it => it !== props.configuration["predicted_variables"][0])
            .map((d, i) => {
                return {
                    name: d,
                    attributionValue: props.attributionValues[i],
                    dataValue: props.dataValues[i]
                }
        })

        // console.log(attributionData)
        const mean = props.configuration.mean;
        const predicted = props.point?.__prediction;
        const actual = props.dataValues[props.featureNames.length]; // TODO

        const ad = accumulatedData(mean, attributionData);
        // const ad = accumulatedData(exampleData);

        // console.log(ad)
        const invertObj = (obj:{[key in string]: number}) => Object.fromEntries(Object.entries(obj).map(a => a.reverse()))
        const getValue = (d:chartable):string => {
            const mapping = props.configuration.label_mapping[d.name];
            if (mapping) {
                return invertObj(mapping)[d.dataValue];
            } else {
                return "" + d.dataValue;
            }
        }


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

        chart.append("text")
            .attr("x", width/3)
            .attr("y", -margin)
            .attr("text-anchor", "middle")
            .attr("font-size", "2em")
            // .text("Signal Attribution")
            .text("Prediction Drivers")
        ;

        // être open sur la tech utilisée:
        // Explicable.AI stands on the shoulders of giants:
        // XGBoost, SHAP, UMAP, RuleFit (Customized version), ThreeJS, (Gamma FACET, Causal libs)
        //   (and scikit-learn, React, D3)
        // so that it can bring you an opinionated data exploration platform with state-of-the-art ML algos woven together in an
        // accessible, fast-actionable manner. Enabling you to dive easily and fast in the smart data management you can do
        // in an integrated BI, inference, enriching, etc. platform
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")// TODO mettre la valeur dans le texte de l'axe aussi
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

        // chart
        //     .append("line")
        //     .style("stroke", "black")
        //     .style("stroke-dasharray", "3")
        //     .attr("x1", xScale(mean) )
        //     .attr("y1", 100)
        //     .attr("x2", xScale(mean) )
        //     .attr("y2", 500)
        // ;

        // if (predicted) {
        //     chart
        //         .append("line")
        //         .style("stroke", "green")
        //         .style("stroke-dasharray", "4")
        //         .attr("x1", xScale(predicted) )
        //         .attr("y1", 100)
        //         .attr("x2", xScale(predicted) )
        //         .attr("y2", 500)
        //     ;
        // }
        // chart
        //     .append("line")
        //     .style("stroke", "yellow")
        //     .style("stroke-dasharray", "5")
        //     .attr("x1", xScale(actual) )
        //     .attr("y1", 100)
        //     .attr("x2", xScale(actual) )
        //     .attr("y2", 500)
        // ;

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
            .style("padding", "10px")
            .style("background", "black")
            .style("color", "white")
            .style("border", "0")
            .style("border-radius", "8px")
            .style("pointer-events", "none")
            .style("left", "0px")
            .style("top", "0px")
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
                tooltip.html(d.name + " (value: " + getValue(d) + ")" + "<br/>" +
                    (numberFormatter.format(d.attributionValue)) + "<br/>" +
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
            tooltip.remove();
        })

    }, [props.featureNames, props.dataValues, props.attributionValues]);


    return (
        <div
            style={{
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
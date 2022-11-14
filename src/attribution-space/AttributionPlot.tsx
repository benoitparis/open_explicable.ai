import React from 'react';
import {DataConfiguration, DataPoint, DataSet} from "./DataManagement";
import * as d3 from "d3";

type NotNullOrUndefined<T> = {
    [P in keyof T]: Exclude<T[P], null | undefined>
}

type AttributionPlotProps = {
    selected: number,
    configuration: DataConfiguration|null,
    dataset: DataSet<any>|null,
    attributionValues: DataSet<any>|null,
    points:DataSet<DataPoint>|null,
}
type test5 = NotNullOrUndefined<AttributionPlotProps>;


const AttributionPlot = (props:AttributionPlotProps) => {

    const loading =
        <div style={{
            margin: "2em",
        }}>
            <pre>Data:</pre>
            <pre>{"Configuration " + (props.configuration    ? "OK" : "Loading...")}</pre>
            <pre>{"Points        " + (props.points           ? "OK" : "Loading...")}</pre>
            <pre>{"Dataset       " + (props.dataset          ? "OK" : "Loading...")}</pre>
            <pre>{"Attributions  " + (props.attributionValues? "OK" : "Loading...")}</pre>
        </div>

    const hasLoaded = props.configuration && props.dataset && props.attributionValues && props.points;
    const plot = () => {
        if (props.configuration && props.dataset && props.attributionValues && props.points) {

            const featureNames = props.configuration.features;
            const number = props.configuration.datapoint_number;
            const point = props.points.data[props.selected];
            const dataObj = props.dataset.data[props.selected];
            const dataValues = featureNames.map(it => dataObj[it]);
            const attributionObj = props.attributionValues.data[props.selected];
            const attributionValues = featureNames.map(it => attributionObj["attribution_" + it]);
            // TODO move server-side? what's the policy? does it consume resources? CPU vs network
            const globalAttributionValues =
                props.attributionValues.data.reduce((prev, curr) => {
                    for (let k in prev) {
                        if (curr.hasOwnProperty(k))
                            prev[k] = (prev[k] || 0) + curr[k];
                    }
                    return prev;
                })
            Object.keys(globalAttributionValues).forEach((key) => globalAttributionValues[key] /= number);

            console.log(globalAttributionValues);

            return (
                <AttributionsWaterfallPlot
                    configuration={props.configuration}
                    featureNames={featureNames}
                    dataValues={dataValues}
                    attributionValues={attributionValues}
                    globalAttributionValues={globalAttributionValues}
                    point={point}
                />
            );
        } else {
            return ""
        }

    };

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
                    plot() : loading
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

const numberFormatterRelative = Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 2,
    signDisplay: "always"
})
const numberFormatterAbsolute = Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 2
})

// TODO coding convention: https://wattenberger.com/blog/react-and-d3
export const AttributionsWaterfallPlot = (props:{
    configuration: DataConfiguration,
    featureNames: string[],
    dataValues: number[],
    attributionValues: number[],
    globalAttributionValues: number[],
    point:DataPoint,
}) => {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = React.useState("0,0,0,0");

    const margin = 20;
    const maxScreenHeight = 800;
    const minBarHeight = 14;
    const barHeight = Math.max(
        minBarHeight,
        (maxScreenHeight + 4 * margin) / props.featureNames.length // 4 arbitrary, to account for left axis text space
    );
    const width = 600;
    let svgHeight = maxScreenHeight;


    const getAutoBox = () => {
        if (!svgRef.current) {
            return "";
        }
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

        const chosenFeatureNames = Object.entries(props.globalAttributionValues)
            .filter(([k, v], i, a) => Math.abs(v) > 0)
            .map(([k, v]) => k.replace("attribution_", ""));

        svgHeight = Math.min(
            maxScreenHeight,
            minBarHeight * chosenFeatureNames.length
        );


        const attributionData:base[] = chosenFeatureNames
            .filter(it => it !== props.configuration["predicted_variables"][0]) // should already be good
            .map((d) => {
                return {
                    name: d,
                    attributionValue: props.attributionValues[props.featureNames.indexOf(d)],
                    dataValue: props.dataValues[props.featureNames.indexOf(d)]
                }
            })

        // console.log(attributionData)
        const mean = props.configuration.mean;
        const predicted = props.point.__prediction;
        // const actual = props.dataValues[props.featureNames.length]; // TODO
        const total = mean + attributionData.map(it => it.attributionValue).reduce((a, b) => a + b);

        const ad = accumulatedData(mean, attributionData);

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
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(domainValue => numberFormatterAbsolute.format(domainValue.valueOf()))
        ;

        const chart = d3.select(svgRef.current)
            .append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")")
        ;

        chart.append("text")
            .attr("x", width/4)
            .attr("y", -3 * margin)
            .attr("text-anchor", "middle")
            .attr("font-size", "2em")
            // .text("Signal Attribution")
            .text("Drivers of " + props.configuration.predicted_variables[0]);
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

        chart
            .append("line")
            .style("stroke", "black")
            .style("stroke-dasharray", "3")
            .attr("x1", xScale(mean) )
            .attr("y1", -margin*3/4)
            .attr("x2", xScale(mean) )
            .attr("y2", (ad.length) * barHeight)
        ;
        chart.append("text")
            .attr("x", xScale(mean))
            .attr("y", -margin)
            .attr("text-anchor", "end")
            .attr("font-size", "1em")
            .text("mean: " + numberFormatterAbsolute.format(mean));
        ;
        chart
            .append("line")
            .style("stroke", "black")
            .style("stroke-dasharray", "3")
            .attr("x1", xScale(total) )
            .attr("y1", -margin*1/4)
            .attr("x2", xScale(total) )
            .attr("y2", (ad.length) * barHeight)
        ;
        chart.append("text")
            .attr("x", xScale(total))
            .attr("y", -margin/2)
            .attr("text-anchor", "end")
            .attr("font-size", "1em")
            .text("total: " + numberFormatterAbsolute.format(total));
        ;

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
                    (numberFormatterRelative.format(d.attributionValue)) + "<br/>" +
                    "(Initial: " + (numberFormatterAbsolute.format(d.start)) + ")"
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
                maxHeight: maxScreenHeight,
                overflow: "overlay",
                width: width + margin,
            }}>
            <svg
                ref={svgRef}
                viewBox={viewBox}>
            </svg>
        </div>
    );

}

export default AttributionPlot;
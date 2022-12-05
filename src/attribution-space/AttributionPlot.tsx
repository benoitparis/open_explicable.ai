import React from 'react';
import {DataConfiguration, DataDescription, DataPoint, DataSet} from "./DataManagement";
import * as d3 from "d3";
import stylesG from "../Globals.module.css";

// TODO use
type Loaded<T> = {
    [P in keyof T]: Exclude<T[P], null | undefined>
}
type AttributionPlotProps = {
    selected: number,
    configuration: DataConfiguration|null,
    dataDescription: DataDescription|null,
    dataValues: DataSet<any>|null,
    attributionValues: DataSet<any>|null,
    points:DataSet<DataPoint>|null,
}
type test5 = Loaded<AttributionPlotProps>;

const AttributionPlot = (props:AttributionPlotProps) => {

    const loading =
        <div style={{
            margin: "2em",
        }}>
            <pre>Data Loading: </pre>
            <pre>{"Configuration    " + (props.configuration    ? "OK" : "Loading...")}</pre>
            <pre>{"Data Description " + (props.dataDescription  ? "OK" : "Loading...")}</pre>
            <pre>{"Points           " + (props.points           ? "OK" : "Loading...")}</pre>
            <pre>{"Dataset values   " + (props.dataValues       ? "OK" : "Loading...")}</pre>
            <pre>{"Attributions     " + (props.attributionValues? "OK" : "Loading...")}</pre>
        </div>

    const landscape = window.innerHeight < window.innerWidth;
    const hasLoaded = props.configuration && props.dataDescription && props.dataValues && props.attributionValues && props.points;
    const plot = () => {
        if (props.configuration && props.dataDescription && props.dataValues && props.attributionValues && props.points) {

            const featureNames = props.configuration.features;
            const number = props.configuration.datapoint_number;
            const point = props.points.data[props.selected];
            const dataObj = props.dataValues.data[props.selected];
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
            Object.keys(globalAttributionValues).forEach(key => globalAttributionValues[key] /= number);

            return (
                <AttributionsWaterfallPlot
                    configuration={props.configuration}
                    dataDescription={props.dataDescription}
                    featureNames={featureNames}
                    dataValues={dataValues}
                    attributionValues={attributionValues}
                    globalAttributionValues={globalAttributionValues}
                    point={point}
                    // TODO totally arbitrary, need to fix/choose it (top10, topX from UI)
                    filterTopN={landscape? 36: 10}
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
            top: landscape?"6em":"",
            bottom: landscape?"":"5em",
            left: "1em",
            zIndex: 4,
        }}>

            <div
                className={stylesG.dashedBox}
                style={{
                    minHeight: hasLoaded ? 75 * window.devicePixelRatio + "px" : 25 * window.devicePixelRatio + "px",
                    maxHeight: hasLoaded ? 1000 * window.devicePixelRatio + "px" : 300 * window.devicePixelRatio + "px",
                    minWidth: hasLoaded ? 200 * window.devicePixelRatio + "px" : 50 * window.devicePixelRatio + "px",
                    maxWidth: hasLoaded ? 800 * window.devicePixelRatio + "px" : 300 * window.devicePixelRatio + "px"
                }}>
                {
                    hasLoaded?
                    // false?
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
    dataDescription: DataDescription,
    featureNames: string[],
    dataValues: number[],
    attributionValues: number[],
    globalAttributionValues: number[],
    point:DataPoint,
    filterTopN:number|null
}) => {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [viewBox, setViewBox] = React.useState("0,0,0,0");

    const margin = 20;
    const maxScreenHeight = 800;
    const minBarHeight = 14;
    const barHeight = Math.max(
        minBarHeight,
        maxScreenHeight / props.featureNames.length // 4 arbitrary, to account for left axis text space
    );
    const width = 400 * window.devicePixelRatio;
    let svgHeight = maxScreenHeight;

    const getAutoBox = () => {
        if (!svgRef.current) {
            return "";
        }
        const {x, y, width, height} = svgRef.current.getBBox();
        return [x, y, width, height].toString();
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

        const threshold = Object.values(props.globalAttributionValues)
            .map(Math.abs)
            .sort((a, b) => b-a)
                [(props.filterTopN||props.configuration.features.length)-1]
        ;

        const chosenFeatureNames = Object.entries(props.globalAttributionValues)
            .filter(([k, v]) => Math.abs(v) >= threshold)
            .map(([k, v]) => k.replace("attribution_", ""));

        svgHeight = Math.min(
            maxScreenHeight,
            minBarHeight * chosenFeatureNames.length
        );

        const attributionData:base[] = chosenFeatureNames
            .filter(it => it !== props.configuration["predicted_variables"][0]) // should already be good
            .map(d => ({
                    name: d,
                    attributionValue: props.attributionValues[props.featureNames.indexOf(d)],
                    dataValue: props.dataValues[props.featureNames.indexOf(d)]
                }))

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
            .domain([
                Math.min(...ad.map(it => it.start), ...ad.map(it => it.end)),
                Math.max(...ad.map(it => it.start), ...ad.map(it => it.end))
            ])
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
            .attr("x1", xScale(mean))
            .attr("y1", -margin*3/4)
            .attr("x2", xScale(mean) )
            .attr("y2", (ad.length) * barHeight)
        ;
        chart.append("text")
            .attr("x", xScale(mean))
            .attr("y", -margin)
            .attr("text-anchor", mean > total ? "end" : "start")
            .attr("font-size", "1em")
            .text("mean: " + numberFormatterAbsolute.format(mean));
        ;
        chart
            .append("line")
            .style("stroke", "black")
            .style("stroke-dasharray", "3")
            .attr("x1", xScale(total))
            .attr("y1", -margin*1/4)
            .attr("x2", xScale(total) )
            .attr("y2", (ad.length) * barHeight)
        ;
        chart.append("text")
            .attr("x", xScale(total))
            .attr("y", -margin/2)
            .attr("text-anchor", total > mean? "end" : "start")
            .attr("font-size", "1em")
            .text("end value: " + numberFormatterAbsolute.format(total));
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

        // TODO append elsewhere, in relative container?
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .attr("class", "tooltip")
            .attr("align","middle")
            .style("opacity", 0)
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
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                let html = "";
                html += d.name + " (value: " + getValue(d) + ")" + "<br/>";
                html += (d.attributionValue>0?"🡆":"🡄") + " " + (numberFormatterRelative.format(d.attributionValue)) + "<br/>";
                html += "(Initial: " + (numberFormatterAbsolute.format(d.start)) + ")" + "<br/>";
                html += props.dataDescription[d.name].description + "<br/>";
                const values = props.dataDescription[d.name].values;
                if (values && values[getValue(d)]) {
                    html += getValue(d) + ": " + values[getValue(d)]
                }
                tooltip.html(html)
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

    const landscape = window.innerHeight < window.innerWidth;
    return (
        <div
            style={{
                maxHeight: maxScreenHeight,
                overflow: "overlay",
                width: landscape?width:"93vw",
            }}>
            <svg
                ref={svgRef}
                viewBox={viewBox}>
            </svg>
        </div>
    );

}

export default AttributionPlot;
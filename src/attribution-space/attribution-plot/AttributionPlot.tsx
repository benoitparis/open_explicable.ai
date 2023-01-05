import React, {useState} from 'react';
import {DataConfiguration, DataDescription, DataPoint, DataSet} from "../DataManagement";
import * as d3 from "d3";
import stylesG from "../../Globals.module.css";
import BottomAxis from "./BottomAxis";
import LeftAxis from "./LeftAxis";
import Title from "./Title";
import VerticalLine from "./VerticalLine";
import WaterfallShapeSeries from "./WaterfallShapeSeries";
import Tooltip from "./Tooltip";

type AttributionPlotProps = {
    selected: number,
    configuration: DataConfiguration|null,
    dataDescription: DataDescription|null,
    dataValues: DataSet<any>|null,
    attributionValues: DataSet<any>|null,
    points:DataSet<DataPoint>|null,
}

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
export type chartable = (base & cumulative)

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
// TODO     avec ça aussi: https://pganalyze.com/blog/building-svg-components-in-react
// TODO     et ça?       : https://www.pluralsight.com/guides/using-d3.js-inside-a-react-app
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


    const threshold = Object.values(props.globalAttributionValues)
        .map(Math.abs)
        .sort((a, b) => b-a)
        [(props.filterTopN||props.configuration.features.length)-1]
    ;

    const chosenFeatureNames = Object.entries(props.globalAttributionValues)
        .filter(([k, v]) => Math.abs(v) >= threshold)
        .map(([k, v]) => k.replace("attribution_", ""));


    let svgHeight = Math.min(
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

    const mean = props.configuration.mean;
    const predicted = props.point.__prediction;
    // const actual = props.dataValues[props.featureNames.length]; // TODO
    const total = mean + attributionData.map(it => it.attributionValue).reduce((a, b) => a + b);

    const ad = accumulatedData(mean, attributionData);

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

    const xScale = d3.scaleLinear()
        .domain([
            // TODO extent? const [start, end] = extent(props.scale.range())
            Math.min(...ad.map(it => it.start), ...ad.map(it => it.end)),
            Math.max(...ad.map(it => it.start), ...ad.map(it => it.end))
        ])
        .range([0, width*(3/5)])
    ;

    const [tooltipPos, setTooltipPos] = useState<{xPos:number, yPos:number}>({xPos:0, yPos:0});
    const [selectedDatum, setSelectedDatum] = useState<chartable|null>(null);
    const tooltip = () => {
        if (selectedDatum) {
            const d = selectedDatum;
            const value = getValue(selectedDatum);
            const values = props.dataDescription[d.name].values;
            return (
                <Tooltip position={tooltipPos}>
                    {`${d.name} (value: ${value})`}<br/>
                    {`${d.attributionValue>0?"🡆":"🡄"} ${numberFormatterRelative.format(d.attributionValue)}`}<br/>
                    {`(Initial: ${numberFormatterAbsolute.format(d.start)})`}<br/>
                    {`${props.dataDescription[d.name].description}`}<br/>
                    {
                        (values && values[value])
                            ? value + ": " + values[value]
                            :""
                    }
                </Tooltip>);
        } else {
            return <div/>;
        }
    }

    const handleMouseOver = (event:any, d:chartable) => {
        setTooltipPos({xPos: event.pageX, yPos: event.pageY});
        setSelectedDatum(d);
    };
    const handleMouseOut = () => {
        setSelectedDatum(null);
    }

    React.useEffect(() => {
        setViewBox(getAutoBox());
    }, []);

    const landscape = window.innerHeight < window.innerWidth;

    // TODO être open sur la tech utilisée:
    // Explicable.AI stands on the shoulders of giants:
    // XGBoost, SHAP, UMAP, RuleFit (Customized version), ThreeJS, (Gamma FACET, Causal libs)
    //   (and scikit-learn, React, D3)
    // so that it can bring you an opinionated data exploration platform with state-of-the-art ML algos woven together in an
    // accessible, fast-actionable manner. Enabling you to dive easily and fast in the smart data management you can do
    // in an integrated BI, inference, enriching, etc. platform

    // TODO dashed lines between bars

    // TODO error: predicted delta actual

    // TODO collapse small contiguous unimportant features

    // TODO simplify margin
    // TODO simplify ad.length * barHeight
    return (
        <>
            {tooltip()}
            <div
                style={{
                    maxHeight: maxScreenHeight,
                    overflow: "overlay",
                    width: landscape?width:"86vw",
                }}>
                <svg
                    ref={svgRef}
                    viewBox={viewBox}>
                    <Title
                        xPos={width/4}
                        yPos={-3*margin}
                        text={`Drivers of ${props.configuration.predicted_variables[0]}`}
                    />
                    <BottomAxis
                        scale={xScale}
                        xPos={0}
                        yPos={ad.length * barHeight}
                        tickFormat={numberFormatterAbsolute.format}
                    />
                    <LeftAxis
                        scale={yScale}
                        xPos={0}
                        yPos={0}
                    />
                    <WaterfallShapeSeries
                        data={ad}
                        barHeight={barHeight}
                        xScale={xScale}
                        yScale={yScale}
                        handleMouseOver={handleMouseOver}
                        handleMouseOut={handleMouseOut}
                    />
                    <VerticalLine
                        xPos={xScale(mean)}
                        yPos1={-margin*3/4}
                        yPos2={ad.length * barHeight}
                        yPosText={-margin}
                        textAnchor={mean > total ? "end" : "start"}
                        text={`mean: ${numberFormatterAbsolute.format(mean)}`}
                    />
                    <VerticalLine
                        xPos={xScale(total)}
                        yPos1={-margin/4}
                        yPos2={ad.length * barHeight}
                        yPosText={-margin/2}
                        textAnchor={mean > total ? "start" : "end"}
                        text={`value: ${numberFormatterAbsolute.format(total)}`}
                    />
                </svg>
            </div>
        </>
    );

}

export default AttributionPlot;
import React from 'react';
import Plot from 'react-plotly.js';
import {DataConfiguration, DataSet} from "./DataManagement";

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
                Data:
                <pre>{"Configuration: " + (props.configuration? "OK" : "Loading...")}</pre>
                <pre>{"Dataset:       " + (props.dataset      ? "OK" : "Loading...")}</pre>
                <pre>{"Attributions:  " + (props.shapValues   ? "OK" : "Loading...")}</pre>
            </div>
        </div>


    console.log(props.selected)
    console.log(attributionValues)

    return (
        <div style={{
            position:"absolute",
            top: "5em",
            left: "1em",
            zIndex: 4,
        }}>
            {
                !(props.configuration && props.dataset && props.shapValues)?
                // true?
                loading : plot
            }
        </div>
    );

}

export default AttributionPlot;
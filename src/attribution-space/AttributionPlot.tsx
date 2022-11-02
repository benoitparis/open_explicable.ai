import React from 'react';
import Plot from 'react-plotly.js';
import {DataConfiguration, DataSet} from "./DataManagement";

const AttributionPlot = (props:{
        selected:number,
        configuration:DataConfiguration,
        dataset:DataSet<any>,
        shapValues:DataSet<any>,
    }) => {

    const featureNames = props.dataset.metadata.schema.map(it => it.name);
    const attributionObj = props.shapValues.data[props.selected];
    const attributionValues = featureNames.map(it => {
        return attributionObj["attribution_" + it];
    })

    console.log(props.selected)
    console.log(attributionValues)

    return (
        <div style={{
            position:"absolute",
            top: "5em",
            right: "1em",
            zIndex: 4,
        }}>
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
        </div>
    );

}

export default AttributionPlot;
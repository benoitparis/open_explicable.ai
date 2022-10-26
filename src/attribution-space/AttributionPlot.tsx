import React from 'react';
import Plot from 'react-plotly.js';

const AttributionPlot = (props:{featureNames?:Array<string>, attributionValues?:Array<number>}) => {

    const featureNames = props.featureNames?props.featureNames:[
        "Sales",
        "Consulting",
        "Purchases",
        "Other expenses",
        "1Sales",
        "1Consulting",
        "1Purchases",
        "1Other expenses",
    ]
    const attributionValues = props.attributionValues?props.attributionValues:[
        60,
        80,
        -40,
        -20,
        60,
        80,
        -40,
        -20,
    ]

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
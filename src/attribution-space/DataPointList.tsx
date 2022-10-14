import React  from 'react'
import DataPoint from "./DataPoint";

function DataPointList() {

    return (
        <>
            <DataPoint position={[-1.2, 0, 0]} />
            <DataPoint position={[1.2, 0, 0]} />
        </>

    )
}

export default DataPointList;
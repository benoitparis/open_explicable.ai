import React from 'react';
import AttributionSpace from "./attribution-space/AttributionSpace";
import WebsiteMain from "./WebsiteMain";
import WebsiteHeader from "./WebsiteHeader";
import "./Website.module.css";


const Website = (props:{displayed:boolean, display:(d:boolean)=>void}) => {
    return (
        <div id="website-wrapper" style={{
            height:"100%",
            overflow: props.displayed?"visible":"hidden",
        }}>

            <WebsiteHeader displayed={props.displayed} display={props.display}>
                <AttributionSpace displayed={!props.displayed} display={() => props.display(false)}/>
            </WebsiteHeader>

            <WebsiteMain displayed={props.displayed}/>

        </div>
    );
}

export default Website;

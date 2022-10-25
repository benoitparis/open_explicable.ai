import React, {PropsWithChildren} from "react";

const CollapsibleDiv = (props:PropsWithChildren<{displayed:boolean, to?:"bottom"|"top"}>) => {
    props = {
        ...props,
        to:"bottom"
    }
    const margin = props.displayed? "0" : "-100%";

    return (
        <div style={{
            overflow: "hidden",
        }}>
            <div style={{
                transition: "all 0.5s ease-out", // TODO from globals
                marginBottom: props.to === "bottom"? margin : "0",
                marginTop:    props.to === "top"   ? margin : "0"
            }}>
                {props.children}
            </div>
        </div>
    )
}

export default CollapsibleDiv;
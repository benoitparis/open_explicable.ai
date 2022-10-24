import React, {PropsWithChildren} from "react";

// TODO?
// export const CollapsibleDivInner =
// export const CollapsibleDivOuter =


const CollapsibleDiv = (props:PropsWithChildren<{displayed:boolean, to?:"bottom"|"top"|"left"|"right"}>) => {
    props = {
        ...props,
        to:"top"
    }
    const margin = props.displayed? "0":"-100%";

    return (
        <div style={{
            overflow: "hidden",
            // maxWidth: props.displayed? "100%":"0"
        }}>
            <div style={{
                transition: "all 0.5s ease-out",
                marginBottom: props.to === "bottom"? "0": margin,
                marginTop:    props.to === "top"   ? "0": margin,
                marginLeft:   props.to === "left"  ? "0": margin,
                marginRight:  props.to === "right" ? "0": margin,
            }}>
                {props.children}
            </div>
        </div>
    )
}

export default CollapsibleDiv;
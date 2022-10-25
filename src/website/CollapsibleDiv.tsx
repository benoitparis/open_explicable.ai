import React, {PropsWithChildren} from "react";
import styles from "./CollapsibleDiv.module.css";

const CollapsibleDiv = (props:PropsWithChildren<{displayed:boolean, to?:"bottom"|"top"}>) => {
    props = {
        ...props,
        to:"bottom"
    }
    const margin = props.displayed? "0" : "-100%";

    return (
        <div className={styles.outer}>
            <div className={styles.inner} style={{
                marginBottom: props.to === "bottom"? margin : "0",
                marginTop:    props.to === "top"   ? margin : "0"
            }}>
                {props.children}
            </div>
        </div>
    )
}

export default CollapsibleDiv;
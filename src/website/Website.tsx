import React, {PropsWithChildren} from 'react';
import WebsiteMain from "./WebsiteMain";
import WebsiteHeader from "./WebsiteHeader";
import styles from "./Website.module.css";


const Website = (props:PropsWithChildren<{displayed:boolean, display:(d:boolean)=>void}>) => {
    return (
        <div className={styles.websiteWrapper} style={{
            overflow: props.displayed?"visible":"hidden",
        }}>

            <WebsiteHeader displayed={props.displayed} display={props.display}>
                {props.children}
            </WebsiteHeader>

            <WebsiteMain displayed={props.displayed}/>

        </div>
    );
}

export default Website;

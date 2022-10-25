import React, {PropsWithChildren} from "react";
import styles from "./WebsiteHeader.module.css";
import {classes} from "./Utils";
import CollapsibleDiv from "./CollapsibleDiv";
import thumbnail from './img/thumbnail.png';
import logo from './img/logo.png';



const HeaderOverlay = (props:{displayed:boolean, display:(d:boolean)=>void}) =>
    <>
        <img src={thumbnail} alt="" style={{display:"none"}}/>

        <div className={styles.logo} onClick={()=>props.display(true)}>
            <a href="#" className={styles.logoA}>
                <img src={logo} className={styles.logoImg} alt="Explicable.AI logo"/>
                <h1 className={styles.logoH1}>Explicable.AI</h1>
            </a>
        </div>

        <ul className={styles.horizontalFit}>
            <li className={styles.horizontalFitOuterBlock}
                onClick={()=>props.display(false)}>
                <a href={"#"} className={styles.horizontalFitOuterBlockA}>
                    <span className={classes(styles.horizontalFitInnerBlock, props.displayed?"":styles.horizontalFitInnerBlockActive)}>
                        App
                    </span>
                </a>
            </li>
            <li className={styles.horizontalFitOuterBlock}
                onClick={()=>props.display(true)}>
                <a href={"#"} className={styles.horizontalFitOuterBlockA}>
                    <span className={classes(styles.horizontalFitInnerBlock, props.displayed?styles.horizontalFitInnerBlockActive:"")}>
                        Home
                    </span>
                </a>
            </li>
            <li className={styles.horizontalFitOuterBlock}>
                <a href={"#features"} className={styles.horizontalFitOuterBlockA}>
                    <span className={classes(styles.horizontalFitInnerBlock, props.displayed?styles.horizontalFitInnerBlockOpened:styles.horizontalFitInnerBlockCollapsed)}>
                        Features
                    </span>
                </a>
            </li>
            <li className={styles.horizontalFitOuterBlock}>
                <a href={"#contact"} className={styles.horizontalFitOuterBlockA}>
                    <span className={classes(styles.horizontalFitInnerBlock, props.displayed?styles.horizontalFitInnerBlockOpened:styles.horizontalFitInnerBlockCollapsed)}>
                        Contact Us
                    </span>
                </a>
            </li>
        </ul>

        <div className={styles.banner}>
            <CollapsibleDiv displayed={props.displayed}>
                <div className={styles.bannerTitle}>
                    <h2 className={styles.bannerTitleH2}>Welcome to your data</h2>
                    <span className={styles.bannerTitleByline}>Rediscover it. Explore its topology. Find subtle yet invaluable signals.</span>
                </div>
            </CollapsibleDiv>
        </div>

        <div id="scroll-arrow" className={styles.scrollArrow}>
            <CollapsibleDiv displayed={props.displayed}>
                <a href={"#features"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 898.75 533.751" fill="#2651a8">
                            <path
                                d="M224.687 309.061L0 84.372l42.186-42.186L84.372 0l182.815 182.811L450 365.622l182.5-182.496L815 .63l41.874 41.874L898.75 84.38 674.062 309.065 449.373 533.751 224.687 309.06z"></path>
                        </svg>
                    </svg>
                </a>
            </CollapsibleDiv>
        </div>
    </>

const WebsiteHeader =  (props:PropsWithChildren<{displayed:boolean, display:(d:boolean)=>void}>) =>
    <div className={styles.headerWrapper} style={{
        height: props.displayed?"90%":"100%"
    }}>
        <div style={{
            position:"absolute",
            top:0,
            width: "100%",
            height: "100vh"
        }}>
            {props.children}
        </div>

        <HeaderOverlay displayed={props.displayed} display={props.display}/>

    </div>

export default WebsiteHeader;
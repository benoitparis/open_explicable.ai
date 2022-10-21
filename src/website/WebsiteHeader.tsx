import React, {PropsWithChildren} from "react";
import styles from "./WebsiteHeader.module.css";

const HeaderOverlay = (props:{displayed:boolean, display:(d:boolean)=>void}) =>
    <>
        <img src="img/thumbnail.png" alt="" style={{display:"none"}}/>

        <div className={styles.logo} style={{}}>
            <a href="#" className={styles.logoA}>
                <img className={styles.logoImg} src="img/logo.png" alt="Explicable.AI logo"/>
                <h1 className={styles.logoH1}>Explicable.AI</h1>
            </a>
        </div>

        <div className={styles.menu} style={{zIndex:1, pointerEvents:"initial"}}>
            <ul className={styles.menuUl} style={{display:"flex"}}>
                <li className={styles.menuLi}
                    onClick={()=>props.display(false)}
                >
                    <a className={[styles.menuLiA, props.displayed?"":styles.menuActiveA].join(" ")} href="#" accessKey="1" title="">
                        <div style={{
                            display: "inline-flex",
                            overflow: "hidden",
                            transition:"all 0.5s ease-out",
                            maxWidth: "100%",
                            fontSize: "inherit",
                        }}>App</div>
                    </a>
                </li>
                <li className={styles.menuLi}
                    onClick={()=>props.display(true)}
                >
                    <a className={[styles.menuLiA, props.displayed?styles.menuActiveA:""].join(" ")} href="#" accessKey="1" title="">
                        <div style={{
                            display: "inline-flex",
                            overflow: "hidden",
                            transition:"all 0.5s ease-out",
                            maxWidth: "100%",
                            fontSize: "inherit",
                        }}>Home</div>
                    </a>
                </li>
                <li className={styles.menuLi}>
                    <a className={styles.menuLiA} href="#features" accessKey="2" title="" style={{
                        paddingLeft: props.displayed?"1.5em":"0",
                        paddingRight: props.displayed?"1.5em":"0",
                        borderWidth: props.displayed?"thin":"0",
                    }}>
                        <div style={{
                            display: "inline-flex",
                            overflow: "hidden",
                            transition:"all 0.5s ease-out",
                            maxWidth: props.displayed?"100%":"0%",
                            fontSize: props.displayed?"inherit":"0",
                        }}>Features</div>
                    </a>
                </li>
                <li className={styles.menuLi}>
                    <a className={styles.menuLiA} href="#copyright" accessKey="2" title="" style={{
                        paddingLeft: props.displayed?"1.5em":"0",
                        paddingRight: props.displayed?"1.5em":"0",
                        borderWidth: props.displayed?"thin":"0",
                    }}>
                        <div style={{
                            display: "inline-flex",
                            overflow: "hidden",
                            transition:"all 0.5s ease-out",
                            maxWidth: props.displayed?"100%":"0%",
                            fontSize: props.displayed?"inherit":"0",
                        }}>Contact Us</div>
                    </a>
                </li>
            </ul>
        </div>

        <div id="banner" className={styles.banner} style={{
            height: props.displayed?"auto":0,
            padding: props.displayed?"auto":0
        }}>
            <div className={styles.bannerTitle} style={{
                height: props.displayed?"100%":0
            }}>
                <h2 className={styles.bannerTitleH2}>Welcome to your data</h2>
                <span className={styles.bannerTitleByline}>Rediscover it. Explore its topology. Find subtle yet invaluable signals.</span>
            </div>
        </div>

        <div id="scroll-arrow" className={styles.scrollArrow} style={{
            height: props.displayed?"auto":0
        }}>
            <a href="#features">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 898.75 533.751" fill="#2651a8">
                        <path
                            d="M224.687 309.061L0 84.372l42.186-42.186L84.372 0l182.815 182.811L450 365.622l182.5-182.496L815 .63l41.874 41.874L898.75 84.38 674.062 309.065 449.373 533.751 224.687 309.06z"></path>
                    </svg>
                </svg>
            </a>
        </div>
    </>

const WebsiteHeader =  (props:PropsWithChildren<{displayed:boolean, display:(d:boolean)=>void}>) =>
    <div className={styles.headerWrapper} style={{
        height: props.displayed?"90%":"100%",
        paddingBottom: props.displayed?"auto":0
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
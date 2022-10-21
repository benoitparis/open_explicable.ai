import React, {PropsWithChildren} from "react";
import styles from "./WebsiteHeader.module.css";
import {classes, collapsable} from "./Utils";

const HeaderOverlay = (props:{displayed:boolean, display:(d:boolean)=>void}) =>
    <>
        <img src="img/thumbnail.png" alt="" style={{display:"none"}}/>

        <div className={styles.logo} onClick={()=>props.display(true)}>
            <a href="#" className={styles.logoA}>
                <img className={styles.logoImg} src="img/logo.png" alt="Explicable.AI logo"/>
                <h1 className={styles.logoH1}>Explicable.AI</h1>
            </a>
        </div>

        <div className={styles.menu}>
            <ul className={styles.menuUl}>
                <li className={styles.menuLi}
                    onClick={()=>props.display(false)}
                >
                    <a className={classes(styles.menuLiA, props.displayed?"":styles.menuActiveA, styles.menuLiAPermanent)} href="#">
                        <p className={styles.menuLiAP}>App</p>
                    </a>
                </li>
                <li className={styles.menuLi}
                    onClick={()=>props.display(true)}
                >
                    <a className={classes(styles.menuLiA, props.displayed?styles.menuActiveA:"", styles.menuLiAPermanent)} href="#">
                        <p className={styles.menuLiAP}>Home</p>
                    </a>
                </li>
                <li className={styles.menuLi}>
                    <a className={classes(collapsable(props.displayed, styles.menuLiA), styles.menuLiAPermanent)} href="#features">
                        <p className={classes(collapsable(props.displayed, styles.menuLiAP), styles.menuLiAPPermanent)}>Features</p>
                    </a>
                </li>
                <li className={styles.menuLi}>
                    <a className={classes(collapsable(props.displayed, styles.menuLiA), styles.menuLiAPermanent)} href="#contact">
                        <p className={classes(collapsable(props.displayed, styles.menuLiAP), styles.menuLiAPPermanent)}>Contact Us</p>
                    </a>
                </li>
            </ul>
        </div>

        <div className={classes(collapsable(props.displayed, styles.banner), styles.bannerPermanent)} style={{
        }}>
            <div className={collapsable(props.displayed, styles.bannerTitle)} style={{
            }}>
                <h2 className={styles.bannerTitleH2}>Welcome to your data</h2>
                <span className={styles.bannerTitleByline}>Rediscover it. Explore its topology. Find subtle yet invaluable signals.</span>
            </div>
        </div>

        <div id="scroll-arrow" className={collapsable(props.displayed, styles.scrollArrow)} style={{
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
    <div className={classes(collapsable(props.displayed, styles.headerWrapper), styles.headerWrapperPermanent)} style={{
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
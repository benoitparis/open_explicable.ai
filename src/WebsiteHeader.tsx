import React, {PropsWithChildren} from "react";

const HeaderOverlay = (props:{displayed:boolean, display:(d:boolean)=>void}) =>
    <>
        <img src="img/thumbnail.png" alt="" style={{display:"none"}}/>

        <div id="logo" style={{position:"initial", pointerEvents:"initial"}}>
            <a href="#">
                <img src="img/logo.png" alt="Explicable.AI logo"/>
                <h1>Explicable.AI</h1>
            </a>
        </div>

        <div id="menu" style={{zIndex:1, pointerEvents:"initial"}}>
            <ul style={{display:"flex"}}>
                <li className={props.displayed?"":"active"}
                    onClick={()=>props.display(false)}
                ><a href="#" accessKey="1" title="">App</a></li>
                <li className={props.displayed?"active":""}
                    onClick={()=>props.display(true)}
                ><a href="#" accessKey="1" title="">Home</a></li>
                <li style={{
                    zIndex:1,
                    pointerEvents:"initial",
                    transition:"all 0.5s ease-out",
                    display: "table-cell"
                }}>
                    <a href="#features" accessKey="2" title="" style={{
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
                <li style={{
                    zIndex:1,
                    pointerEvents:"initial",
                    transition:"all 0.5s ease-out",
                    display: "table-cell"
                }}>
                    <a href="#copyright" accessKey="2" title="" style={{
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

        <div id="banner" className="container" style={{
            zIndex:1,
            pointerEvents:"initial",
            transition:"all 0.5s ease-out",
            height: props.displayed?"auto":0,
            padding: props.displayed?"auto":0
        }}>
            <div className="title" style={{
                transition:"all 0.5s ease-out",
                height: props.displayed?"100%":0
            }}>
                <h2>Welcome to your data</h2>
                <span className="byline">Rediscover it. Explore its topology. Find subtle yet invaluable signals.</span>
            </div>
        </div>

        <div id="scroll-arrow" style={{
            zIndex:1,
            pointerEvents:"initial",
            transition:"all 0.5s ease-out",
            height: props.displayed?"auto":0
        }}>
            <a href="#features">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 898.75 533.751" fill="#fff">
                        <path
                            d="M224.687 309.061L0 84.372l42.186-42.186L84.372 0l182.815 182.811L450 365.622l182.5-182.496L815 .63l41.874 41.874L898.75 84.38 674.062 309.065 449.373 533.751 224.687 309.06z"></path>
                    </svg>
                </svg>
            </a>
        </div>
    </>

const WebsiteHeader =  (props:PropsWithChildren<{displayed:boolean, display:(d:boolean)=>void}>) =>
    <div id="header-wrapper" style={{
        transition:"all 0.5s ease-out",
        height: props.displayed?"90%":"100%",
        paddingBottom: props.displayed?"auto":0
    }}>
        <div id="app-wrapper" style={{
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
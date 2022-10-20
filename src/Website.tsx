import React from 'react';
import ContactForm from "./ContactForm";
import AttributionSpace from "./attribution-space/AttributionSpace";

function Website(props:{displayed:boolean, display:(d:boolean)=>void}) {
    return (
        <div id="website-wrapper" style={{
            height:"100%",
            overflow: props.displayed?"visible":"hidden",
            // transform:props.displayed?"":"scale(1, 0)",
            // transition: "all",
            // transformOrigin: "bottom"
        }}>

            <div id="header-wrapper" style={{
                // pointerEvents:"none",
                transition:"all 0.5s ease-out",
                height: props.displayed?"90%":"100%",
                paddingBottom: props.displayed?"auto":0
            }}>
                <div id="app-wrapper" style={{
                    position:"absolute",
                    top:0,
                    width: "100%",
                    height: "100vh",
                    //zIndex:10
                }}>
                    <AttributionSpace displayed={!props.displayed} display={() => props.display(false)}/>
                </div>

                <img src="img/thumbnail.png" alt="" style={{display:"none"}}/>

                {/*<div id="header"*/}
                {/*     className="container"*/}
                {/*     onClick={()=>props.display(true)}>*/}

                    <div id="logo" style={{position:"initial", pointerEvents:"initial"}}>
                        <a href="#">
                            <img src="img/logo.png" alt="Explicable.AI logo"/>
                            <h1>Explicable.AI</h1>
                        </a>
                    </div>
                {/*</div>*/}

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
                            // width: props.displayed?"auto":"0px",
                            // overflow: props.displayed?"initial":"hidden",
                            display: "table-cell"
                        }}>
                            <a href="#services" accessKey="2" title="" style={{
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
                                    // paddingLeft: props.displayed?"1.5em":"0",
                                    // paddingRight: props.displayed?"inherit":"0",
                                }}>Features</div>
                            </a>
                        </li>
                        <li style={{
                            zIndex:1,
                            pointerEvents:"initial",
                            transition:"all 0.5s ease-out",
                            // width: props.displayed?"auto":"0px",
                            // overflow: props.displayed?"initial":"hidden",
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
                                    // paddingLeft: props.displayed?"1.5em":"0",
                                    // paddingRight: props.displayed?"inherit":"0",
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
                    <a href="#services">
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 898.75 533.751" fill="#fff">
                                <path
                                    d="M224.687 309.061L0 84.372l42.186-42.186L84.372 0l182.815 182.811L450 365.622l182.5-182.496L815 .63l41.874 41.874L898.75 84.38 674.062 309.065 449.373 533.751 224.687 309.06z"></path>
                            </svg>
                        </svg>
                    </a>
                </div>

            </div>

            <div id="main-wrapper" style={{}}>
                <div id="services-wrapper" style={{
                    transition:"all 0.5s ease-out",
                    height: props.displayed?"auto":"0%",
                    paddingBottom: props.displayed?"7em":0,
                    paddingTop: props.displayed?"3em":0
                }}>
                    <div id="services"
                         // style={{paddingBottom: "3em"}}
                    >
                        <div className="title">
                            <h2>Features</h2>
                            <span className="byline"></span>
                        </div>
                        <div id="feature-list" className="container">
                            <div className="box">
                                <p>We use algorithms that win competitions, we just open them and present how they take
                                    their
                                    decisions.</p>
                                <a href="#" className="button button-alt">Performant</a>
                            </div>
                            <div className="box">
                                <p>Know exactly how your models work. Establish compliance easily</p>
                                <a href="#" className="button button-alt">Transparent</a>
                            </div>
                            <div className="box">
                                <p>Gain deep insights about the topology of your clients, at an intuitive glance</p>
                                <a href="#" className="button button-alt">Visual</a>
                            </div>
                            <div className="box">
                                <p>Fully fledged data management, Extract-Transform-Load &amp; Machine Learning environment
                                    working
                                    together</p>
                                <a href="#" className="button button-alt">Agile</a>
                            </div>
                            <div className="box">
                                <p>Follow the driving signals in the data as a management principle, concentrate only on
                                    data that has
                                    value</p>
                                <a href="#" className="button button-alt">Smart</a>
                            </div>
                            <div className="box">
                                <p>Join open datasets with your data, and enable further insights and performance</p>
                                <a href="#" className="button button-alt">Enriched</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="welcome" style={{
                    transition:"all 0.5s ease-out",
                    height: props.displayed?"auto":"0%",
                    paddingBottom: props.displayed?"auto":0,
                    paddingTop: props.displayed?"auto":0
                }}>
                    <div id="welcome-msg" className="container" style={{
                        transition:"all 0.5s ease-out",
                        height: props.displayed?"auto":"0%",
                        paddingBottom: props.displayed?"3em":0,
                        paddingTop: props.displayed?"3em":0,
                        maxWidth: "60em",
                    }}>
                        <div className="title" style={{
                            transition:"all 0.5s ease-out",
                            height: props.displayed?"auto":"0%",
                            paddingBottom: props.displayed?"auto":0,
                            paddingTop: props.displayed?"auto":0
                        }}>
                            <h2>Explicable Machine Learning</h2>
                            <span className="byline">Explore the hidden signals in your data</span>
                        </div>
                        <p>
                            Gain invaluable insights from your existing databases that you would have otherwise missed with
                            regular machine learning. Use state-of-the-art predictive algorithms that we make open and inspectable
                            to you. Discover implicit structures and how they relate to events like customers buying your
                            product.
                        </p>
                        <ContactForm/>
                    </div>
                </div>
                <div id="copyright" className="container" style={{
                    backgroundColor: "black",
                    backgroundSize: "cover",
                    position: "relative",
                    width: "100%"
                }}>
                    <p>2017-2022 © <a href="http://benoit.paris">Benoît Paris Consulting</a> | All rights reserved</p>
                </div>
            </div>
        </div>
    );
}

export default Website;

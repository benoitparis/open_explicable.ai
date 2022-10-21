import WebsiteContactForm from "./WebsiteContactForm";
import React from "react";
import styles from "./WebsiteMain.module.css";
import stylesGlobals from "./Globals.module.css";

const FeatureBox = (props:{name:string, description:string}) =>
    <div>
        <p className={styles.boxP}>{props.description}</p>
        <a className={styles.boxButton}>{props.name}</a>
    </div>

const features = [
    {name:"Performant",  description:"We use algorithms that win competitions, we just open them and present how they take their decisions"},
    {name:"Transparent", description:"Know exactly how your models work. Establish compliance easily"},
    {name:"Visual",      description:"Gain deep insights about the topology of your clients, at an intuitive glance"},
    {name:"Agile",       description:"Fully fledged data management, Extract-Transform-Load & Machine Learning environment working together"},
    {name:"Smart",       description:"Follow the driving signals in the data as a management principle, concentrate only on data that has value"},
    {name:"Enriched",    description:"Join open datasets with your data, and enable further insights and performance"},
]

const FeatureList = features.map(it => <FeatureBox name={it.name} description={it.description}/>)

const Features = (props:{displayed:boolean}) =>
    <div className={styles.featuresWrapper} style={{
        transition:"all 0.5s ease-out",
        height: props.displayed?"auto":"0%",
        paddingBottom: props.displayed?"7em":0,
        paddingTop: props.displayed?"3em":0
    }}>
        <div id="features">
            <div className={styles.featureTitle}>
                <h2 className={styles.featuresTitleH2}>Features</h2>
            </div>
            <div className={styles.featureList}>
                {FeatureList}
            </div>
        </div>
    </div>

const Welcome = (props:{displayed:boolean}) =>
    <div className={styles.welcome} style={{
        transition:"all 0.5s ease-out",
        height: props.displayed?"auto":"0%",
        paddingBottom: props.displayed?"auto":0,
        paddingTop: props.displayed?"auto":0
    }}>
        <div className={styles.welcomeMsg}  style={{
            transition:"all 0.5s ease-out",
            height: props.displayed?"auto":"0%",
            paddingBottom: props.displayed?"3em":0,
            paddingTop: props.displayed?"3em":0,
            maxWidth: "60em",
        }}>
            <div className={styles.welcomeTitle} style={{
                transition:"all 0.5s ease-out",
                height: props.displayed?"auto":"0%",
                paddingBottom: props.displayed?"auto":0,
                paddingTop: props.displayed?"auto":0
            }}>
                <h2 className={styles.welcomeTitleH2}>Explicable Machine Learning</h2>
                <span  className={styles.welcomeTitleByLine}>Explore the hidden signals in your data</span>
            </div>
            <p>
                Gain invaluable insights from your existing databases that you would have otherwise missed with
                regular machine learning. Use state-of-the-art predictive algorithms that we make open and inspectable
                to you. Discover implicit structures and how they relate to events like customers buying your
                product.
            </p>
            <WebsiteContactForm/>
        </div>
    </div>

const Copyright = () =>
    <div className={styles.copyright} style={{
        backgroundColor: "black",
        backgroundSize: "cover",
        position: "relative",
        width: "100%"
    }}>
        <p className={styles.copyrightP}>
            2017-2022 © <a className={styles.copyrightA} href="http://benoit.paris">Benoît Paris Consulting</a> | All rights reserved
        </p>
    </div>

const WebsiteMain = (props:{displayed:boolean}) =>
    <div id="main-wrapper">
        <Features  displayed={props.displayed}/>
        <Welcome   displayed={props.displayed}/>
        <Copyright/>
    </div>

export default WebsiteMain;
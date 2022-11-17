import WebsiteContactForm from "./WebsiteContactForm";
import React from "react";
import styles from "./WebsiteMain.module.css";
import CollapsibleDiv from "./CollapsibleDiv";

const FeatureBox = (props:{name:string, description:string}) =>
    <div>
        <p className={styles.boxP}>{props.description}</p>
        <a className={styles.boxButton}>{props.name}</a>
    </div>

const features = [
    {name:"Performant",   description:"We use algorithms that win competitions, we just open them and distill how they take their decisions"},
    {name:"Transparent",  description:"Know exactly how your models work. Use them confidently. Establish compliance easily"},
    {name:"Visual",       description:"Gain deep insights about the topology of your business data, at an intuitive glance"},
    {name:"Data-Driving", description:"Share how your AIs make their decisions across your org. Aggregate insights from your knowledge workers"},
    {name:"Focused",      description:"Follow the driving signals in the data as a management principle, concentrate only on data that has value"},
    {name:"Simple",       description:"Just upload a Excel with blank values if you wish to get them back predicted."},
]

const FeatureList = features.map(it => <FeatureBox key={it.name} name={it.name} description={it.description}/>)

const Features = () =>
    <div className={styles.featuresWrapper}>
        <div id="features">
            <div className={styles.featureTitle}>
                <h2 className={styles.featuresTitleH2}>Features</h2>
            </div>
            <div className={styles.featureList}>
                {FeatureList}
            </div>
        </div>
    </div>

const Welcome = () =>
    <div className={styles.welcome}>
        <div className={styles.welcomeMsg}>
            <div className={styles.welcomeTitle} style={{
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
    <div className={styles.copyright}>
        <p className={styles.copyrightP}>
            2017-2022 © <a className={styles.copyrightA} href="http://benoit.paris">Benoît Paris Consulting</a> | All rights reserved
        </p>
    </div>

const WebsiteMain = (props:{displayed:boolean}) =>
    <CollapsibleDiv displayed={props.displayed}>
        <div>
            <Features/>
            <Welcome/>
            <Copyright/>
        </div>
    </CollapsibleDiv>

export default WebsiteMain;
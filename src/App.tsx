import React from 'react';
import ContactForm from "./ContactForm";
import AttributionSpace from "./attribution-space/AttributionSpace";

function App() {
    return (
        <>
            <div id="wrapper">
                <div id="services">
                    <div id="three-column" className="container">
                        <div className="title">
                            <h2>Services</h2>
                            <span className="byline"></span>
                        </div>
                        <div className="boxA">
                            <p>We use algorithms that win competitions, we just open them and present how they take
                                their
                                decisions.</p>
                            <a href="#" className="button button-alt">Performant</a>
                        </div>
                        <div className="boxB">
                            <p>Know exactly how your models work. Establish compliance easily</p>
                            <a href="#" className="button button-alt">Transparent</a>
                        </div>
                        <div className="boxC">
                            <p>Gain deep insights about the topology of your clients, at an intuitive glance</p>
                            <a href="#" className="button button-alt">Visual</a>
                        </div>
                        <div className="boxA">
                            <p>Fully fledged data management, Extract-Transform-Load &amp; Machine Learning environment
                                working
                                together</p>
                            <a href="#" className="button button-alt">Agile</a>
                        </div>
                        <div className="boxB">
                            <p>Follow the driving signals in the data as a management principle, concentrate only on
                                data that has
                                value</p>
                            <a href="#" className="button button-alt">Smart</a>
                        </div>
                        <div className="boxC">
                            <p>Join open datasets with your data, and enable further insights and performance</p>
                            <a href="#" className="button button-alt">Enriched</a>
                        </div>
                    </div>
                </div>
            </div>
            <div id="welcome">
                <div id="welcome-msg" className="container">
                    <div className="title">
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
            <div id="copyright" className="container">
                <p>2017-2022 © <a href="http://benoit.paris">Benoît Paris Consulting</a> | All rights reserved</p>
            </div>
            <AttributionSpace/>
        </>
    );
}

export default App;

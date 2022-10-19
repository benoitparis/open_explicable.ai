import React, {useState} from 'react';
import AttributionSpace from "./attribution-space/AttributionSpace";
import Website from "./Website";

function App() {

    const [showWebsite, setShowWebsite] = useState(true);


    return (
        <>

            {/*<div id="app-wrapper" style={{*/}
            {/*    position:"absolute",*/}
            {/*    top:0,*/}
            {/*    width: "100%",*/}
            {/*    height: "100%",*/}
            {/*    //zIndex:10*/}
            {/*}}>*/}
            {/*    <AttributionSpace showSpace={() => setShowWebsite(false)}/>*/}
            {/*</div>*/}

            {/*<div style={{transition: "height 2s", height: showWebsite?"100%":0}}><Website/></div>*/}
            <Website displayed={showWebsite} display={setShowWebsite}/>
        </>
    );
}

export default App;

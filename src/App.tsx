import React, {useState} from 'react';
import Website from "./website/Website";
import AttributionSpace from "./attribution-space/AttributionSpace";

function App() {

    const [showWebsite, setShowWebsite] = useState(true);

    return (
        <Website displayed={showWebsite} display={setShowWebsite}>
            <AttributionSpace displayed={!showWebsite} display={() => setShowWebsite(false)}/>
        </Website>
    );
}

export default App;

import React, {useEffect, useMemo, useRef, useState} from 'react'
import {DataTour} from "./DataManagement";

const ANIMATION_PERIOD = 2000;

const DataTourMenu = (props: {
    dataTour:DataTour|null,
    setSelected:(index:number|null) => void,
    setShowWaterfall:(showIt:boolean) => void,
    display:(d:boolean)=>void,
    setCameraFollows:(follows:boolean) => void
}) => {

    const [touring, setTouring] = useState(false);
    const [step, setStep] = useState(0);
    const [animationCycle, setAnimationCycle] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setAnimationCycle(a => a + 1);
        }, ANIMATION_PERIOD);
        return () => {
            clearInterval(id);
        };
    }, []);

    useEffect(() => {
        if (props.dataTour) {
            const points = props.dataTour[step].selected_data_points_ids;
            console.log(points)
            if (points && points.length > 1) {
                // race condition?
                props.setCameraFollows(false);
            }
            if (points && points.length > 0) {
                props.setSelected(points[animationCycle % points.length]);
            }
        }
    }, [step, animationCycle]);

    const next = () => {
        if (props.dataTour) {
            let newStep;
            if (props.dataTour.length - 1 === step) {
                newStep = 0;
                setTouring(false);
                props.setShowWaterfall(true);
            } else {
                newStep = step + 1;
            }
            props.setShowWaterfall(props.dataTour[newStep].show_waterfall);
            setStep(newStep);
        }
    }

    // safe inputs, TODO maybe later markdown subset?
    const convertLinks = (input:string):JSX.Element => {
        const regex = /(?<before>.*)\[(?<anchor>.*)\]\((?<url>.*)\)(?<remainder>.*)/;
        const found = input.match(regex);
        if (found && found.groups) {
            console.log(found.groups);
            return(<>
                {found.groups.before}
                <a href={found.groups.url}>{found.groups.anchor}</a>
                {convertLinks(found.groups.remainder)}
            </>);
        } else {
            return(<>{input}</>);
        }
    }


    return (
        <div>
            {props.dataTour?<>

                <div style={{
                    position:"absolute",
                    top: "6em",
                    right: "1em",
                    zIndex: 4,
                }}>
                    <div
                        style={{
                            background:"white",
                            opacity: 0.95,
                            borderRadius: "15px",
                            borderWidth: "5px",
                            borderColor: "grey",
                            borderStyle: "dashed",
                            transition: "all 2s ease-out",
                            padding: "1em",
                            overflow: "hidden",
                            maxWidth: "20vw",
                        }}>
                        {touring
                            ?
                            <div>
                                <div
                                    style={{
                                        fontSize: "1.3em"
                                    }}>
                                    {props.dataTour[step].title}
                                </div>
                                <div>{convertLinks(props.dataTour[step].body)}</div>
                                <button
                                    onClick={next}
                                    style={{
                                        marginTop: "0.5em"
                                    }}>
                                    {props.dataTour.length - 1 === step?"Close":"Next"}
                                </button>
                            </div>
                            :
                            <button
                                onClick={() => {setTouring(true); props.display(true)}}>
                                Take the tour
                            </button>
                        }
                    </div>
                </div>
            </>:""}
        </div>

    )
}

export default DataTourMenu;
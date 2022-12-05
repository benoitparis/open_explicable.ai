import React, {useEffect, useState} from 'react'
import {DataTour} from "./DataManagement";
import stylesG from "../Globals.module.css";

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
                props.setCameraFollows(true);
            } else {
                newStep = step + 1;
                props.setShowWaterfall(props.dataTour[newStep].show_waterfall);
            }
            setStep(newStep);
        }
    }

    // safe inputs, TODO maybe later markdown subset?
    const convertLinks = (input:string):JSX.Element => {
        const regex = /(?<before>.*)\[(?<anchor>.*)\]\((?<url>.*)\)(?<remainder>.*)/;
        const found = input.match(regex);
        if (found && found.groups) {
            // console.log(found.groups);
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
                        className={stylesG.dashedBox}
                        style={{
                            padding: "1em",
                            maxWidth: "25em",
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
                                        marginTop: "0.5em",
                                        fontSize: "inherit"
                                    }}>
                                    <div>
                                        {props.dataTour.length - 1 === step?"Close":"Next"}
                                    </div>
                                </button>
                            </div>
                            :
                            <button
                                onClick={() => {setTouring(true); props.display(true)}}
                                style={{
                                    fontFamily: "'Didact Gothic', sans-serif",
                                    fontSize: "inherit"
                                }}
                            >
                                <div>
                                    Take the tour
                                </div>
                            </button>
                        }
                    </div>
                </div>
            </>:""}
        </div>

    )
}

export default DataTourMenu;
import { useState } from "react";
import { AnimationEndCallback, backgrounds, isColorLight, useStaggerAnimation } from "../utils";


const items = [...Array(6)]

export function HashTag(
    props: {
        onAnimateComplete?: AnimationEndCallback;
    }
) {
    const [open, setOpen] = useState(true);
    const scope = useStaggerAnimation(open, () => {
        if (!open) {
            props.onAnimateComplete?.({
                animation: "HashTag"
            });
        }
        setOpen(false);
    });

    return <>
        <div className="parent" ref={scope}>
            {
                items.map((_, index) => (
                    <div className="height-change" key={index} >
                        <div className="h1parent" style={{
                            transform: open ? "translateX(100vw)" : "translateX(0vw)",
                            backgroundColor: backgrounds[index % backgrounds.length],
                            display: "flex",
                            justifyContent: "center",
                            overflow: "hidden",
                            color: isColorLight(backgrounds[index % backgrounds.length]) ? "#121212" : "#f2ff48"
                        }} >
                            <h1 style={
                                {
                                    fontSize: innerWidth / 7.3
                                }
                            }> #JPCSGAAP24 </h1>
                        </div>
                    </div>


                ))
            }
        </div>
    </>
}
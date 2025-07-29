import { useState } from "react";
import { AnimationEndCallback, backgrounds, isColorLight, useStaggerAnimation } from "../utils";

const items = [...Array(5)]



export function Year(
    props: {
        onAnimateComplete?: AnimationEndCallback;
    }
) {
    const [open, setOpen] = useState(true);
    const scope = useStaggerAnimation(open, () => {
        if (!open) {
            props.onAnimateComplete?.({
                animation: "Year",
            });
        }
        setOpen(false);
    });


    return <div className="parent"
        ref={scope}
    >
        {
            items.map((_, index) => (
                <div className="height-change" key={index} >
                    <div className="h1parent" style={{
                        transform: open ? "translateX(100vw)" : "translateX(0vw)",
                        backgroundColor: backgrounds[index % backgrounds.length],
                        color: isColorLight(backgrounds[index % backgrounds.length]) ? "#121212" : "#f2ff48"
                    }} >
                        <h1 style={
                            {
                                fontSize: innerWidth / 2.5
                            }
                        }> 2024 </h1>
                    </div>
                </div>


            ))
        }

    </div>


}
import { useAnimate } from "framer-motion";
import { useEffect } from "react";

function useZoomAnimation(open: boolean, endScale: number, onAnimateComplete?: () => void) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        if (open) {

            scope.current.querySelector(".spike")?.style.setProperty("scale", "0.001");
            scope.current.querySelector(".spike2")?.style.setProperty("scale", "0.001");

            setTimeout(() => {
                onAnimateComplete && onAnimateComplete();
            }, 1000);

            animate(
                ".spike",
                {
                    rotate: -60,
                    scale: endScale
                },
                {
                    duration: 2.5,
                    ease: "easeOut",
                }
            )

            animate(
                ".spike2",
                {
                    rotate: -80,
                    scale: endScale
                },
                {
                    duration: 2.6,
                    delay: 0.5,
                    ease: "easeOut",
                }
            )
            return;
        }


    }, [open]);

    return scope;
}

export function ZoomIn(
    props: {
        onAnimateComplete?: () => void;
        svg: React.FunctionComponent;
        previousBackground?: string,
        endScale: number;
        colors: string[]
    }
) {

    const scope = useZoomAnimation(true, props.endScale, () => {
        props.onAnimateComplete && props.onAnimateComplete();
    });


    return <>
        <div className="jpcs-logo-container" ref={scope} style={{
            backgroundColor: props.previousBackground ?? "transparent",
        }}>
            <div className="jpcs-logo" style={{
                color: props.colors[0]
            }}>
                <div className="spike"> <props.svg /> </div>

            </div>

            <div className="jpcs-logo" style={{
                color: props.colors[1]
            }}>
                <div className="spike spike2"> <props.svg /> </div>
            </div>
        </div>
    </>;
}
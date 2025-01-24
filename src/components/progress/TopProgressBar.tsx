import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

function TopProgressBar() {

    const location = useLocation();
    const ref = useRef<LoadingBarRef>(null);

    useEffect(()=>{
        if(ref.current)
            ref.current.continuousStart();

        const timer = setTimeout(()=>{
            if(ref.current)
                ref.current.complete();
        },1000);

        return ()=> clearTimeout(timer);
    },[location.pathname])
  return <LoadingBar color="#22c55e" ref={ref} height={3} shadow={true} shadowStyle={{ boxShadow: "0 4px 10px rgba(34, 197, 94, 0.4)" }}/>
}

export default TopProgressBar
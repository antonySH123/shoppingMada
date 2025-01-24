import { useEffect, useState } from "react";

const useScroll = () => {
    const [scroll, setScroll] = useState(false);
    useEffect(() => {
        window.onscroll = () => {
            if (window.scrollY > 0) {
                setScroll(true);
            } else {
                setScroll(false);
            }
        };
    }, []);
    return scroll;
}

export default useScroll;
import { useMemo } from "react"

const useFormatter = ()=>{
    const formatter = useMemo(()=>{
        return new Intl.NumberFormat('fr-MG', {
            style:"currency",
            currency:"MGA",
            maximumFractionDigits:0
        })
    },[])

    const priceInArriary = (price: number): string=> formatter.format(price)
    return {priceInArriary}
}

export default useFormatter;
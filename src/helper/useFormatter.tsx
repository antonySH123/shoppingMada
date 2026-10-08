import { useMemo } from "react"
import { useAuth } from "./useAuth";
import { useLanguage } from "../context/useLanguage";

const useFormatter = ()=>{
    const { user, currencyRates } = useAuth();
    const { language } = useLanguage();
    const currency = user?.preferences?.currency ?? "MGA";
    const rate = currency === "EUR" ? currencyRates.EUR : currency === "USD" ? currencyRates.USD : null;
    const locale = language === "fr" ? "fr-MG" : "en-US";
    const formatter = useMemo(()=>new Intl.NumberFormat(locale, {
        style:"currency", currency: currency === "MGA" || !currencyRates.fresh || !rate ? "MGA" : currency, maximumFractionDigits: currency === "MGA" || !rate ? 0 : 2
    }),[currency, currencyRates.fresh, locale, rate]);

    const priceInArriary = (price: number): string=> formatter.format(currency === "MGA" || !currencyRates.fresh || !rate ? price : price / rate)
    return {priceInArriary}
}

export default useFormatter;

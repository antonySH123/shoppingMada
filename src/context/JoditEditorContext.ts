import { createContext, useContext } from "react"

interface IContent{
    content: string;
    setNewContent: (content: string)=> void
}

const ProductContext = createContext<IContent | undefined>(undefined);

const useContent = ():IContent =>{

    const content = useContext(ProductContext)
    if(!content){
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return content;
}

export {ProductContext, useContent};
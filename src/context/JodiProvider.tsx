import { useState } from "react"
import { ProductContext } from "./JoditEditorContext";


type Props ={
    children: React.ReactNode
}

const JodiProvider : React.FC<Props> = ({children})=>{
    const [content, setContent] = useState<string>("");

    const setNewContent = (content: string)=> setContent(content);

    const value = {content, setNewContent}
    
    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export default JodiProvider;
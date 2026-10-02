import { useState, type ReactNode } from "react";
import { ProductContext } from "./ProductContextDefinition";
type Props={
    children: ReactNode
}

const ProductProvider: React.FC<Props> = ({children})=>{
    const [selectedCategoryId, setSelectedCategoryState] = useState<string | null>(null);
    const setSelectedCategoryId = (categoryId: string | null)=>{
        setSelectedCategoryState(categoryId);
    }
    const value ={selectedCategoryId, setSelectedCategoryId}
    return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export default ProductProvider


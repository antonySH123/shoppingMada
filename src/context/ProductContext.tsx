import React, { createContext, useContext, useState } from "react";
type Props={
    children: React.ReactNode
}

interface IProductContext{
    selectedCategoryId:string | null,
    setSelectedCategoryId : (categoryId: string | null)=> void
}

const ProductContext = createContext<IProductContext | undefined>(undefined);
export const useCategory = () : IProductContext=>{
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useCategory must be used within an CategoryProvider");
      }
    return context;
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


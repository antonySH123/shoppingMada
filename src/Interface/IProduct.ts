export default interface IProduct{
    _id : string;
    name: string;
    description:string;
    details:string;
    category:string;
    price:number;
    stock?:number;
    photos?:[string];
    owner_id:string;
    boutiks_id:{
        name:string;
        logo:string;
        phoneNumber:string;
        email:string;
        _id:string;
        adresse:string;
    };
    variant:Ivariant[]
}

interface Ivariant{
    _id:string;
    name:string;
    values:IVariantValue[];
}
interface IVariantValue {
    value: string;
    additionalPrice?: number;
    stock: number;
  }
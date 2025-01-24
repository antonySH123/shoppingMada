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
}
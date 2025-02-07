import IProduct from "./IProduct";
import Iuser from "./UserInterface";

export default interface ICommande {
  _id: string;
  product_id: IProduct;
  owner_id: Iuser;
  variants: { [key: string]: string };
  total: number;
  quantity: number;
  status: string;
}
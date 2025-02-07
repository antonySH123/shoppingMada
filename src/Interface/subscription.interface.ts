import Iuser from "./UserInterface"

export default interface Isubscription{
    _id:string 
    owner_id: Iuser
    plan:string
    transactionPhoneNumber:string,
    refTransaction:string
    selectedPhoneNumber:string,
    payementStatus: "Pending" | "Completed" |"Rejected" | "Canceled"
    startDate: Date,
    endDate : Date
}
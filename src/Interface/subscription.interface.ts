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
    endDate : Date,
    paymentMethodName?: string;
    paymentAccountName?: string;
    paymentAccountNumber?: string;
    paymentInstructions?: string;
    priceMGA?: number;
    lifecycleStatus?: "active" | "grace" | "expired" | "canceled";
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date;
    graceUntil?: Date;
    refundedMGA?: number;
}

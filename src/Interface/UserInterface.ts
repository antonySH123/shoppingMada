import Isubscription from "./subscription.interface";

export default interface Iuser{
    _id:string,
    username:string,
    phonenumber:string,
    email:string,
    password:string,
    boutiks_id:IBoutiks
    personnalInfo_id:IPersonnalInfo
    userGroupMember_id:Iusergroupmember
}

interface IBoutiks{
    _id:string,
    name:string,
    phoneNumber:string,
    adresse:string,
    email:string,
    plan:string,
    subscription_id:Isubscription

}

interface IPersonnalInfo{
    _id:string;
    lastName:string;
    firstName:string;
    phoneNumber:string;
    gender:string;
    adresse:string;
    cin:string;
}

interface Iusergroupmember{
    user_id:string,
    usergroup_id:Iusergroup
}

interface Iusergroup{
    _id:string,
    name: string
}
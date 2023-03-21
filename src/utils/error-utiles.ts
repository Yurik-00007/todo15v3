import {setAppErrorAC, SetAppErrorACType, setAppStatusAC, SetAppStatusACType} from "../app/app-reducer";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api";


export const handleServerAppError=<T>(data:ResponseType<T>,dispatch:ErrorUtilsDispatchType)=>{
    if (data.messages.length) {
        dispatch(setAppErrorAC(data.messages[0]))
    } else {
        dispatch(setAppErrorAC(`Some error occurred`))
    }
    dispatch(setAppStatusAC("failed"))
}

export const handleServerNetworkError=(error:{message:string},dispatch:ErrorUtilsDispatchType)=>{
    dispatch(setAppErrorAC(error.message?error.message:`Some error occurred`))
    dispatch(setAppStatusAC('failed'))
}

type ErrorUtilsDispatchType=Dispatch<
    |SetAppStatusACType
    |SetAppErrorACType
    >


type testObjType={
    name:string
    age:number
}

const testObj={
    name:'Kim',
    age:20
}
const test =(arg:string|number|testObjType|testObjType[]):string|number|testObjType|testObjType[]=>{
    return arg
}

export type ErrorCustomType={
    messages:string[]
    fileError:string
}
/*
//function declaration
function identity<T>(arg: T): T {
    return arg;
}
//function expression
const identity2=<T>(arg:T):T=>{
    return arg
}
const data=test(testObj)
//data.name
// Property 'name' does not exist on type 'string | number | testObjType | testObjType[]'.
// Property 'name' does not exist on type 'string'.
const data2=identity(testObj)
console.log(data2.name)//понимает какой это объект
const data3=identity2<testObjType[]>//что просходит под капотом
([testObj])
data3.map((el)=>el.age)//понимает какой это объект
*/

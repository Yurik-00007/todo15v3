export  type RequestStatusType='idle'|'loading'|'succeded'|'failed'
const initialState={
    status:'loading' as RequestStatusType,
    error:null as null|string
}

type ErrorType=typeof initialState.error

export type InitialStateType=typeof initialState

export type SetAppStatusACType =ReturnType<typeof setAppStatusAC>
export type SetAppErrorACType=ReturnType<typeof setAppErrorAC>
type ActionType=
    |SetAppStatusACType
    |SetAppErrorACType

export const appReducer=(state:InitialStateType=initialState,action:ActionType):InitialStateType=>{
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case "APP/SET-ERROR":
            return {...state,error: action.error}
        default:
            return state
    }
}

export const setAppStatusAC=(status:RequestStatusType)=>({type:'APP/SET-STATUS',status}as const)
export const setAppErrorAC=(error:ErrorType)=>({type:'APP/SET-ERROR',error}as const)
import {ResultCode, TaskType, todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {
    RequestStatusType,
    setAppErrorAC,
    SetAppErrorACType,
    setAppStatusAC,
    SetAppStatusACType
} from "../../app/app-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utiles";

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.id)
        case 'ADD-TODOLIST':
            return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
        case 'SET-TODOLISTS':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        case "CHANGE-TODOLIST-ENTITY-STATUS":
            return state.map(tl => tl.id === action.todolistsId ? {...tl, entityStatus: action.entytyStatus} : tl)
        default:
            return state
    }
}

// actions
export const removeTodolistAC = (id: string) => ({type: 'REMOVE-TODOLIST', id} as const)
export const addTodolistAC = (todolist: TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title
} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter
} as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) => ({type: 'SET-TODOLISTS', todolists} as const)
export const changeTodolistEntityStatusAC = (todolistsId: string, entytyStatus: RequestStatusType) => ({
    type: 'CHANGE-TODOLIST-ENTITY-STATUS',
    entytyStatus,
    todolistsId
} as const)
// thunks
export const fetchTodolistsTC = () => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC('loading'))
        //debugger
        todolistsAPI.getTodolists()
            .then((res) => {
                // debugger
                // console.log(res)
                dispatch(setTodolistsAC(res.data))
                dispatch(setAppStatusAC("succeded"))
            })
            .catch((err) => {
                //debugger
                handleServerNetworkError(err, dispatch)
                // dispatch(setAppStatusAC('failed'))
                // dispatch((setAppErrorAC(err.message)))
            })
        // .finally(()=>{
        //     dispatch(setAppStatusAC('succeded'))
        // })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC('loading'))
        dispatch(changeTodolistEntityStatusAC(todolistId, 'loading'))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                if (res.data.resultCode === ResultCode.Ok) {
                    dispatch(removeTodolistAC(todolistId))
                    dispatch(setAppStatusAC("succeded"))
                } else {
                    handleServerAppError(res.data,dispatch)
                    //или
                    //     handleServerAppError<{}>(res.data,dispatch)

                    // if (res.data.messages.length) {
                    //     dispatch(setAppErrorAC(res.data.messages[0]))
                    // } else {
                    //     dispatch(setAppErrorAC(`Some error occurred`))
                    // }
                    // dispatch(setAppStatusAC('failed'))
                }
            })
            .catch((err) => {
                handleServerNetworkError(err, dispatch)
                //debugger
                // dispatch(setAppErrorAC(err.message?err.message:`Some error occurred`))
                // dispatch(setAppStatusAC('failed'))
                dispatch(changeTodolistEntityStatusAC(todolistId, 'failed'))

            })
        // .finally(()=>setAppStatusAC('succeded'))

    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC('loading'))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                if (res.data.resultCode === ResultCode.Ok) {
                    dispatch(addTodolistAC(res.data.data.item))
                    dispatch(setAppStatusAC("succeded"))
                } else {
                    handleServerAppError(res.data,dispatch)
                    //или
                        //handleServerAppError<{item:TodolistType}>(res.data,dispatch)
                    // if (res.data.messages.length) {
                    //     dispatch(setAppErrorAC(res.data.messages[0]))
                    // } else {
                    //     dispatch(setAppErrorAC(`Some error occurred`))
                    // }
                    dispatch(setAppStatusAC("failed"))

                }
            })
            .catch((err) => {
                //debugger
                 handleServerNetworkError(err, dispatch)
                // dispatch(setAppStatusAC('failed'))
                // dispatch((setAppErrorAC(err.message)))
            })

        //.finally(()=>setAppStatusAC('succeded'))

    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC('loading'))
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                if(res.data.resultCode===ResultCode.Ok) {
                    dispatch(changeTodolistTitleAC(id, title))
                    dispatch(setAppStatusAC("succeded"))
                }else {
                    handleServerAppError(res.data,dispatch)

                    // if (res.data.messages.length) {
                    //     dispatch(setAppErrorAC(res.data.messages[0]))
                    // } else {
                    //     dispatch(setAppErrorAC(`Some error occurred`))
                    // }
                    // dispatch(setAppStatusAC("failed"))
                }
            })
            .catch((err) => {
                //debugger
                handleServerNetworkError(err, dispatch)
                // dispatch(setAppStatusAC('failed'))
                // dispatch((setAppErrorAC(err.message)))
            })
        //.finally(()=>setAppStatusAC('succeded'))

    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
export type ChangeTodolistEntityStatusACType = ReturnType<typeof changeTodolistEntityStatusAC>

type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | SetAppStatusACType
    | SetAppErrorACType
    | ChangeTodolistEntityStatusACType

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

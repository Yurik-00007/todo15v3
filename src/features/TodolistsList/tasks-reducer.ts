import {
    AddTodolistActionType,
    changeTodolistEntityStatusAC,
    RemoveTodolistActionType,
    SetTodolistsActionType
} from './todolists-reducer'
import {
    ResultCode,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {
    RequestStatusType,
    setAppErrorAC,
    SetAppErrorACType,
    setAppStatusAC,
    SetAppStatusACType
} from "../../app/app-reducer";
import {ErrorCustomType, handleServerAppError, handleServerNetworkError} from "../../utils/error-utiles";
import axios, {AxiosError} from "axios";

const initialState: TasksStateType = {}


export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            return {
                ...state,
                [action.task.todoListId]: [{...action.task, entityTaskStatus: 'idle'}, ...state[action.task.todoListId]]
            }

        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case 'ADD-TODOLIST':
            return {...state, [action.todolist.id]: []}
        case 'REMOVE-TODOLIST':
            const copyState = {...state}
            delete copyState[action.id]
            return copyState
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':
            return {...state, [action.todolistId]: action.tasks.map(t => ({...t, entityTaskStatus: 'idle'}))}
        case "CHANGE-TASK-ENTITY-STATUS":
            return {...state,[action.todolistsId]:state[action.todolistsId]
                    .map(t=>t.id===action.taskId?{...t,entityTaskStatus:action.entytyStatus}:t)}
        default:
            return state
    }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)
export const changeTaskEntityStatusAC = (todolistsId: string, taskId: string, entytyStatus: RequestStatusType) => ({
    type: 'CHANGE-TASK-ENTITY-STATUS',
    todolistsId,
    taskId,
    entytyStatus
} as const)
// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setAppStatusAC('loading'))
    //debugger
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            //debugger
            //console.log(res.data.error===null)
            if (res.data.error === null) {
                //debugger
                const tasks = res.data.items
                const action = setTasksAC(tasks, todolistId)
                dispatch(action)
                dispatch(setAppStatusAC("succeded"))
            } else {
                //handleServerAppError(res.data, dispatch)
                if (res.data.error) {
                    if (res.data.error) {
                        dispatch(setAppErrorAC(res.data.error))
                    } else {
                        dispatch(setAppErrorAC(`Some error occurred`))
                    }
                    dispatch(setAppStatusAC("failed"))
                }

            }

        })
        .catch((err) => {
            //debugger
            // handleServerNetworkError(err, dispatch)
            dispatch(setAppStatusAC('failed'))
            dispatch((setAppErrorAC(err.message)))
        })
    // .finally(() => {
    //     debugger
    //     //return setAppStatusAC('succeded')
    //})
}
export const removeTaskTC = (taskId: string, todolistId: string) =>
    async (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC('loading'))
        dispatch(changeTaskEntityStatusAC(todolistId,taskId, 'loading'))
        try {
            const result = await todolistsAPI.deleteTask(todolistId, taskId)
            if (result.data.resultCode === ResultCode.Ok) {
                const action = removeTaskAC(taskId, todolistId)
                dispatch(action)
                dispatch(setAppStatusAC("succeded"))
            } else {
                handleServerAppError(result.data, dispatch)
                // if (res.data.messages.length) {
                //     dispatch(setAppErrorAC(res.data.messages[0]))
                // } else {
                //     dispatch(setAppErrorAC(`Some error occurred`))
                // }
                // dispatch(setAppStatusAC("failed"))
            }
        } catch (err) {
            //if(axios.isAxiosError<ErrorCustomType>(err)) {
            if (axios.isAxiosError(err)) {
                // const error=err.response?err.response.data.messages:err.message
                // const error1=err.response?.data.messages
                // error1.messages
                //типизация котора будет дальше у игната
                handleServerNetworkError(err, dispatch)
                dispatch(changeTaskEntityStatusAC(todolistId,taskId, 'failed'))
            }
        }
    }
//todolistsAPI.deleteTask(todolistId, taskId)
// .then(res => {
//     if (res.data.resultCode === ResultCode.Ok) {
//         const action = removeTaskAC(taskId, todolistId)
//         dispatch(action)
//         dispatch(setAppStatusAC("succeded"))
//     } else {
//         //handleServerAppError(res.data, dispatch)
//         if (res.data.messages.length) {
//             dispatch(setAppErrorAC(res.data.messages[0]))
//         } else {
//             dispatch(setAppErrorAC(`Some error occurred`))
//         }
//         dispatch(setAppStatusAC("failed"))
//     }
// })
// }
//     .catch((err) => {
//         // handleServerNetworkError(err, dispatch)
//         dispatch(setAppStatusAC('failed'))
//         dispatch((setAppErrorAC(err.message)))
//     })
// .finally(() => setAppStatusAC('succeded'))


export const addTaskTC = (title: string, todolistId: string) =>
    (dispatch: Dispatch<ActionsType>) => {
        dispatch(setAppStatusAC('loading'))
        todolistsAPI.createTask(todolistId, title)
            .then(res => {
                if (res.data.resultCode === ResultCode.Ok) {
                    const task = res.data.data.item
                    const action = addTaskAC(task)
                    dispatch(action)
                    dispatch(setAppStatusAC("succeded"))
                } else {
                    //handleServerAppError(res.data, dispatch)
                    if (res.data.messages.length) {
                        dispatch(setAppErrorAC(res.data.messages[0]))
                    } else {
                        dispatch(setAppErrorAC(`Some error occurred`))
                    }
                    dispatch(setAppStatusAC("failed"))
                }
            })
            .catch((err) => {
                //debugger
                handleServerNetworkError(err, dispatch)
                // dispatch(setAppStatusAC('failed'))
                // dispatch((setAppErrorAC(err.message)))
            })
        // .finally(() => setAppStatusAC('succeded'))

    }
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        dispatch(setAppStatusAC('loading'))
        todolistsAPI.updateTask(todolistId, taskId, apiModel)

            .then(res => {
                if (res.data.resultCode === ResultCode.Ok) {
                    const action = updateTaskAC(taskId, domainModel, todolistId)
                    dispatch(action)
                    dispatch(setAppStatusAC("succeded"))
                } else {
                    handleServerAppError(res.data, dispatch)
                    // if(res.data.messages.length){
                    //     dispatch(setAppErrorAC(res.data.messages[0]))
                    // }else{
                    //     dispatch(setAppErrorAC(`Something error occurred`))
                    // }
                    // dispatch(setAppStatusAC("failed"))
                }
            })
            .catch((err: AxiosError<ErrorCustomType>) => {
                const error = err.response ? err.response.data.messages : err.message
                handleServerNetworkError(err, dispatch)
                // dispatch(setAppErrorAC(err.message))
                // dispatch(setAppStatusAC('failed'))
            })
        // .finally(() => setAppStatusAC('succeded'))
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType & { entityTaskStatus: RequestStatusType }>
}

export type ChangeTaskEntityStatusACType = ReturnType<typeof changeTaskEntityStatusAC>

type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>
    | SetAppStatusACType
    | SetAppErrorACType
    | ChangeTaskEntityStatusACType

// type ActionSuccess<T> = {
//   success: true
//   message?: string
//   data: T
// }

// type ActionError = {
//   success: false
//   message: string
//   fieldErrors: Record<string, string[]>
// }

// export type ActionResponse<T> = ActionSuccess<T> | ActionError
// type ActionFailure = {
//   success: false
//   message: string
//   fieldErrors?: Record<string, string[]>
// }

// type ActionSuccess<T> = {
//   success: true
//   message?: string
//   data: T
// }

// export type ActionResponse<T> = ActionFailure | ActionSuccess<T>

// types/action-response.ts
type ActionFailure = {
  success: false
  message: string
  fieldErrors?: Record<string, string[]>
}

type ActionSuccess<T> = {
  success: true
  message?: string
  data: T
  fieldErrors?: Record<string, string[]> // <- ADD, optional, never set on success but makes property exist
}

export type ActionResponse<T> = ActionFailure | ActionSuccess<T>
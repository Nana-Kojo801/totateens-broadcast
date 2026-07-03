// The daily broadcast time is fixed at midnight UTC — not user-configurable.
// A single shared constant so every display in the app agrees, instead of
// each page hardcoding its own copy of the time.
export const SEND_HOUR_UTC = 0
export const SEND_MINUTE_UTC = 0
export const SEND_TIME_LABEL = '00:00 GMT'

// dev wss://5g3opj068a.execute-api.us-west-2.amazonaws.com/dev/
// prod wss://yf8adv3utf.execute-api.us-west-2.amazonaws.com/production/
const URL = 'wss://yf8adv3utf.execute-api.us-west-2.amazonaws.com/production/'

export const socket = new WebSocket(URL)

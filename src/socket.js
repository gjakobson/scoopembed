import {io} from 'socket.io-client';

const URL = 'https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/sheetserver/socket'

export const socket = io(URL)

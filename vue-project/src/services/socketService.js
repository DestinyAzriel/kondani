import { io } from 'socket.io-client'

class SocketService {
    constructor() {
        this.socket = null
        this.isConnected = false
    }

    connect() {
        if (this.socket) return

        const token = localStorage.getItem('kondani_token')
        const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

        this.socket = io(url, {
            auth: {
                token
            },
            transports: ['websocket'],
            autoConnect: true
        })

        this.socket.on('connect', () => {
            console.log('Socket connected')
            this.isConnected = true
        })

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected')
            this.isConnected = false
        })

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err)
            this.isConnected = false
        })
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.isConnected = false
        }
    }

    on(event, callback) {
        if (!this.socket) return
        this.socket.on(event, callback)
    }

    off(event, callback) {
        if (!this.socket) return
        this.socket.off(event, callback)
    }

    emit(event, data) {
        if (!this.socket) return
        this.socket.emit(event, data)
    }

    // WebRTC Signaling Methods
    callUser(data) {
        // data: { userToCall, signalData, from }
        this.emit('call_user', data)
    }

    answerCall(data) {
        // data: { to, signal }
        this.emit('answer_call', data)
    }

    sendIceCandidate(data) {
        // data: { to, candidate }
        this.emit('ice_candidate', data)
    }
}

export const socketService = new SocketService()

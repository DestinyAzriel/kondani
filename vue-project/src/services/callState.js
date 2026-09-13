import { reactive } from 'vue'

// Shared state to hand an incoming call's offer and candidates from AppLayout's global
// listener to the VideoCallView the callee navigates into.
export const callState = reactive({
  offer: null,               // RTCSessionDescriptionInit from the caller
  peerId: null,              // the other user's id to signal back to
  mode: 'video',             // 'video' | 'audio'
  peerName: '',
  peerPhoto: '',
  pendingCandidates: []      // Early ICE candidates received before call view mounted
})

export function clearCall() {
  callState.offer = null
  callState.peerId = null
  callState.mode = 'video'
  callState.peerName = ''
  callState.peerPhoto = ''
  callState.pendingCandidates = []
}


let initIntervalHandle = null
let activeClientWindow = null

// Initialize the connection to the client window
function initializeClient(clientWindow) {
  activeClientWindow = clientWindow

  // Send an initialization message to the client,
  // the signature property is included so that the
  // client doesn't get confused by other similiar
  // looking messages (checking origin would fix this)
  // Using '*' as the targetOrigin is somewhat unsafe but
  // in production we could use the domain of the feedbacked
  // target site.
  const sendInit = () => {
    clientWindow.postMessage({
      type: 'init',
      signature: 'app-unique-identifier',
    }, '*')
  }

  // Keep spamming the initialization message in case the
  // client takes time to load and hasn't registered the
  // message event listener yet.
  sendInit()
  initIntervalHandle = window.setInterval(sendInit, 100)
}

// Initialize the feedback tool pointed at some URL
function initialize(url) {
  const frame = document.querySelector('#client-frame')
  frame.src = url
  initializeClient(frame.contentWindow)
}

// Dispatch table for different event types
const messageHandlers = {

  startedLoading: (msg) => {
    // The client has started loading the library, no need to
    // spam init messages anymore
    if (initIntervalHandle !== null) {
      console.log('Client has started loading')
      window.clearInterval(initIntervalHandle)
      initIntervalHandle = null
    }
  },

  doneLoading: (msg) => {
  console.log('Client has been connected with version: ' + msg.version)
  },

  hoverElement: (msg) => {
  const el = document.querySelector('#hover-text')
  el.innerText = 'Hovered text: ' + msg.text
  },

}

// Hook a message event listener and filter messages from
// the <iframe> we're interested in. Events are actually handled
// by the dispatch table above.
window.addEventListener('message', (e) => {
  if (e.source !== activeClientWindow) return
  const msg = e.data
  if (typeof msg !== 'object') return
  const handler = messageHandlers[msg.type]
  if (handler !== undefined)
  handler(msg)
})

document.querySelector('#set-background').addEventListener('click', () => {
  if (!activeClientWindow) return
  activeClientWindow.postMessage({
    type: 'setBackground',
    color: '#f00',
  }, '*')
})

// This is just a temporary hardcoded URL for the example, in
// production this would be retrieved from possibly our own URL.
initialize('client.html')


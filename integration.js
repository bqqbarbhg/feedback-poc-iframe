
// This shouldn't be in the global namespace, but some module
let previousHoveredElement = null

// This is just some example behavior...
window.addEventListener('mousemove', (e) => {
  const { clientX: x, clientY: y } = e
  const el = document.elementFromPoint(x, y)
  if (el === previousHoveredElement) return
  previousHoveredElement = el

  let text = ''
  if (el.childNodes.length <= 1 && typeof el.innerText === 'string')
    text = el.innerText

  window.parent.postMessage({
    type: 'hoverElement', text
  }, '*')
})

// Dispatch table for different event types
const messageHandlers = {

  init: (msg) => {
    // Explicit no-op for potential extra initialization messages
  },

  setBackground: (msg) => {
    document.body.style.backgroundColor = msg.color
  },

}

window.addEventListener('message', (e) => {
  if (e.source !== window.parent) return
  const msg = e.data
  if (typeof msg !== 'object') return
  const handler = messageHandlers[msg.type]
  if (handler !== undefined)
  handler(msg)
})

// Let the feedback tool know that we have finished loading
window.parent.postMessage({
  type: 'doneLoading',
  version: '0.0.1',
}, '*')


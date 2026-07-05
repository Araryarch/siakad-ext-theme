const toggle = document.getElementById('toggleMain')

function getCurrentTab() {
  return chrome.tabs.query({ active: true, currentWindow: true })
}

function sendToTab(enabled) {
  getCurrentTab().then(([tab]) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'toggleSiapad', enabled }).catch(() => {})
    }
  })
}

chrome.storage.sync.get('siapadEnabled', (data) => {
  toggle.checked = data.siapadEnabled !== false
})

toggle.addEventListener('change', () => {
  const enabled = toggle.checked
  chrome.storage.sync.set({ siapadEnabled: enabled })
  sendToTab(enabled)
})

const unloadListener = (event: BeforeUnloadEvent) => {
  event.preventDefault()
  return (event.returnValue = '')
}

export function addUnloadConfirm() {
  addEventListener('beforeunload', unloadListener)
}

export function removeUnloadConfirm() {
  removeEventListener('beforeunload', unloadListener)
}
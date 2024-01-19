import { ElMessage } from 'element-plus'
import { useSystemStore } from '@/stores/system'

export default (promise: Promise<any>) => {
  const systemStore = useSystemStore()
  let isFinished = false
  const onFinal = (func: Function) => {
    if (isFinished) {
      return
    }
    isFinished = true
    func()
    systemStore.setLoading(false)
  }
  systemStore.setLoading(true)
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      onFinal(() => {
        ElMessage.error('Network Error.')
        reject(new Error('Timed out.'))
      })
    }, 8000)
    promise.then((result) => {
      onFinal(() => {
        clearTimeout(timeoutId)
        resolve(result)
      })
    }).catch((error) => {
      onFinal(() => {
        ElMessage.error('Network Error.')
        reject(error)
      })
    })
  })
}
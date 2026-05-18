import { useEffect, useState } from 'react'
import { paintStore } from './paintStore'

export function usePaintStoreVersion(): number {
  const [version, setVersion] = useState(0)
  useEffect(() => paintStore.subscribe(() => setVersion((v) => v + 1)), [])
  return version
}

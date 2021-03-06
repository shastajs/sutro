import join from 'url-join'
import dp from 'dot-prop'
import walkResources from './walkResources'
import { Resources, Meta } from './types'

export default ({
  base,
  resources
}: {
  base?: string
  resources: Resources
}): Meta => {
  const paths = {}
  walkResources(
    resources,
    ({ hierarchy, path, method, instance, endpoint }) => {
      if (endpoint?.hidden) return // skip
      const descriptor = {
        path: base ? join(base, path as string) : path,
        method,
        instance
      }
      dp.set(paths, hierarchy, descriptor)
    }
  )
  return paths
}

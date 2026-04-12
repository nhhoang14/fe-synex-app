import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return undefined

    const previousTitle = document.title
    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])
}

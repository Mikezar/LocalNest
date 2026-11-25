export interface Crumb {
  label: string
  path: string
}

/** 'C:/Projects/LocalNest' → C: (C:/), Projects (C:/Projects), LocalNest (C:/Projects/LocalNest). */
export function breadcrumbs(path: string): Crumb[] {
  const isPosix = path.startsWith('/')
  const segments = path.split(/[/\\]/).filter(Boolean)
  return segments.map((label, i) => {
    const joined = segments.slice(0, i + 1).join('/')
    return { label, path: isPosix ? `/${joined}` : i === 0 ? `${joined}/` : joined }
  })
}

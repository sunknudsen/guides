// Path helpers. Whether a path exists (file or folder) and whether it is a
// regular file.

import { stat } from "node:fs/promises"

export const exists = (path: string): Promise<boolean> =>
  stat(path).then(
    () => true,
    () => false
  )

export const isFile = (path: string): Promise<boolean> =>
  stat(path).then(
    (stats) => stats.isFile(),
    () => false
  )

/**
 * Load a JS library dynamically
 * @param libName
 * @returns {Promise<*>}
 */
export const loadJsLibrary = async <T = unknown>(libName: string): Promise<T> => {
  const { default: library } = await import(libName)
  return library as T
}

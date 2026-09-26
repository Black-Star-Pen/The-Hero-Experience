/**
 * Loads a page of the site from scratch: everything kept in memory (cache of
 * the API, state of the components) is dropped. Isolated here to be mocked in
 * the tests, jsdom cannot load pages.
 */
export function reloadAt(path: string): void {
  window.location.assign(path);
}

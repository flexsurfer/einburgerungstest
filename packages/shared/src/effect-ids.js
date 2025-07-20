// Effect and Co-effect IDs constants
export const EFFECT_IDS = {
  // Storage effects
  LOCAL_STORAGE_SET: 'localStorageSet',
  LOCAL_STORAGE_REMOVE: 'localStorageRemove',
  LOCAL_STORAGE_GET: 'localStorageGet', // co-effect

  // HTTP effects
  FETCH: 'fetch',
  LOAD_LOCAL_DATA: 'loadLocalData',
  
  // UI effects
  SCROLL_TO_TOP: 'scrollToTop',
  CONFIRM_CLEAR: 'confirmClear'
} 
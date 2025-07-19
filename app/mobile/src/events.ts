import { regEvent } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { EFFECT_IDS } from 'shared/effect-ids'

// ===== TYPES =====

interface InitializeAppPayload {
  // No payload needed for initialization
}

interface StorageLoadedPayload {
  key: string
  value: any
}

interface StorageLoadErrorPayload {
  key: string
  error: string
}

// ===== MOBILE-SPECIFIC EVENT OVERRIDES =====

// Override FETCH_QUESTIONS to use local data instead of URL
regEvent(EVENT_IDS.FETCH_QUESTIONS, ({ draftDb }: { draftDb: any }) => {
  draftDb.questionsLoading = true
  draftDb.questionsError = null
  return [
    [EFFECT_IDS.LOAD_LOCAL_DATA, {
      dataType: 'questions',
      onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
      onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
    }]
  ]
})

// Override FETCH_VOCABULARY to use local data instead of URL
regEvent(EVENT_IDS.FETCH_VOCABULARY, ({ draftDb }: { draftDb: any }) => {
  draftDb.vocabularyLoading = true
  draftDb.vocabularyError = null
  return [
    [EFFECT_IDS.LOAD_LOCAL_DATA, {
      dataType: 'vocabulary',
      onSuccess: [EVENT_IDS.FETCH_VOCABULARY_SUCCESS],
      onFailure: [EVENT_IDS.FETCH_VOCABULARY_FAILURE]
    }]
  ]
})

// ===== MOBILE STORAGE EVENTS =====

// Initialize application - start loading data from AsyncStorage
regEvent(EVENT_IDS.INITIALIZE_APP, 
  ({ draftDb }: { draftDb: any }) => {  
    // Initialize loading state
    draftDb.storageLoading = {
      userAnswers: null,
      favorites: null,
      showWelcome: null,
      loadedCount: 0
    }
    
    // Return effects to load all required data from AsyncStorage
    return [
      [EFFECT_IDS.LOCAL_STORAGE_GET, {
        key: 'userAnswers',
        onSuccess: [EVENT_IDS.STORAGE_LOADED],
        onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
      }],
      [EFFECT_IDS.LOCAL_STORAGE_GET, {
        key: 'favorites',
        onSuccess: [EVENT_IDS.STORAGE_LOADED],
        onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
      }],
      [EFFECT_IDS.LOCAL_STORAGE_GET, {
        key: 'showWelcome',
        onSuccess: [EVENT_IDS.STORAGE_LOADED],
        onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
      }]
    ]
  }
)

// Handle successful storage load
regEvent(EVENT_IDS.STORAGE_LOADED,
  ({ draftDb }: { draftDb: any }, result: StorageLoadedPayload) => {
    const { key, value } = result
    
    // Update the specific storage value
    switch (key) {
      case 'userAnswers':
        draftDb.userAnswers = value || {}
        draftDb.storageLoading.userAnswers = value || {}
        break
      case 'favorites':
        draftDb.favorites = value || []
        draftDb.storageLoading.favorites = value || []
        break
      case 'showWelcome':
        draftDb.showWelcome = value ?? true
        draftDb.storageLoading.showWelcome = value ?? true
        break
    }
    
    // Increment loaded count
    draftDb.storageLoading.loadedCount++
    
    // If all 3 storage items are loaded, proceed with app initialization
    if (draftDb.storageLoading.loadedCount >= 3) {
      // Clean up loading state
      delete draftDb.storageLoading
      
      // Dispatch next event to fetch questions (which will now use local data)
      return [
        ['dispatch', [EVENT_IDS.FETCH_QUESTIONS]]
      ]
    }
    
    // Return empty array if not all items loaded yet
    return []
  }
)

// Handle failed storage load
regEvent(EVENT_IDS.STORAGE_LOAD_FAILED,
  ({ draftDb }: { draftDb: any }, error: { key: string, error: string }) => {
    console.warn(`Failed to load ${error.key} from AsyncStorage:`, error.error)
    
    // Set default values for failed loads
    switch (error.key) {
      case 'userAnswers':
        draftDb.userAnswers = {}
        draftDb.storageLoading.userAnswers = {}
        break
      case 'favorites':
        draftDb.favorites = []
        draftDb.storageLoading.favorites = []
        break
      case 'showWelcome':
        draftDb.showWelcome = true
        draftDb.storageLoading.showWelcome = true
        break
    }
    
    // Increment loaded count (even for failures)
    draftDb.storageLoading.loadedCount++
    
    // If all 3 storage items are processed, proceed with app initialization
    if (draftDb.storageLoading.loadedCount >= 3) {
      // Clean up loading state
      delete draftDb.storageLoading
      
      // Dispatch next event to fetch questions (which will now use local data)
      return [
        ['dispatch', [EVENT_IDS.FETCH_QUESTIONS]]
      ]
    }
    
    // Return empty array if not all items processed yet
    return []
  }
) 
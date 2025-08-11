import { regEvent } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { EFFECT_IDS } from 'shared/effect-ids'
import { Appearance } from 'react-native'

interface StorageLoadedPayload {
  key: string
  value: any
}

regEvent(EVENT_IDS.INITIALIZE_APP,
  ({ draftDb }: { draftDb: any }) => {

    draftDb.questionsLoading = true
    draftDb.questionsError = null

    // Return effects to load all required data from AsyncStorage
    return [
      [EFFECT_IDS.LOAD_LOCAL_DATA, {
        dataType: 'questions',
        onSuccess: [EVENT_IDS.FETCH_QUESTIONS_SUCCESS],
        onFailure: [EVENT_IDS.FETCH_QUESTIONS_FAILURE]
      }],
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
        key: 'theme',
        onSuccess: [EVENT_IDS.STORAGE_LOADED],
        onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
      }],
      [EFFECT_IDS.LOCAL_STORAGE_GET, {
        key: 'selectedCategory',
        onSuccess: [EVENT_IDS.STORAGE_LOADED],
        onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
      }],
      [EFFECT_IDS.LOCAL_STORAGE_GET, {
        key: 'currentQuestionIndex',
        onSuccess: [EVENT_IDS.STORAGE_LOADED],
        onFailure: [EVENT_IDS.STORAGE_LOAD_FAILED]
      }]
    ]
  }
)

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

// Handle successful storage load
regEvent(EVENT_IDS.STORAGE_LOADED,
  ({ draftDb }: { draftDb: any }, result: StorageLoadedPayload) => {
    const { key, value } = result

    // Update the specific storage value
    switch (key) {
      case 'userAnswers':
        draftDb.userAnswers = value || {}
        break
      case 'favorites':
        draftDb.favorites = value || []
        break
      case 'theme':
        if (value) {
          draftDb.theme = value
          draftDb.useSystemTheme = false
        } else {
          draftDb.theme = Appearance.getColorScheme() || 'light'
          draftDb.useSystemTheme = true
        }
        break
      case 'selectedCategory':
        if (value !== null && value !== undefined) {
          draftDb.selectedCategory = value
        }
        break
      case 'currentQuestionIndex':
        if (value !== null && value !== undefined) {
          draftDb.currentQuestionIndex = value
        }
        break
    }
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
        break
      case 'favorites':
        draftDb.favorites = []
        break
      case 'theme':
        draftDb.theme = Appearance.getColorScheme() || 'light'
        draftDb.useSystemTheme = true
        break
      case 'selectedCategory':
        // Keep default value (null) if not found in storage
        break
      case 'currentQuestionIndex':
        // Keep default value (0) if not found in storage  
        break
    }
  }
)

regEvent(EVENT_IDS.SYSTEM_THEME_CHANGED, ({ draftDb }, scheme) => {
  if (draftDb.useSystemTheme) {
    draftDb.theme = scheme || 'light'
    return [
      [EFFECT_IDS.LOCAL_STORAGE_SET, { key: 'theme', value: draftDb.theme }]
    ]
  }
}) 
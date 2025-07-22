import { regEffect, dispatch } from "@flexsurfer/reflex"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { EFFECT_IDS } from 'shared/effect-ids'
import { questionListRef } from './refs';

// Import data files using correct relative paths from mobile app to shared assets
import questionsData from '../../../packages/shared/assets/data.json'
import vocabularyData from '../../../packages/shared/assets/vocabulary_multilang.json'

// ===== TYPES =====

interface LocalStorageSetPayload {
    key: string
    value: any
}

interface LocalStorageRemovePayload {
    key: string
}

interface FetchPayload {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    onSuccess?: any[]
    onFailure?: any[]
}

interface LoadLocalDataPayload {
    dataType: 'questions' | 'vocabulary'
    onSuccess?: any[]
    onFailure?: any[]
}

interface LocalStorageGetPayload {
    key: string
    onSuccess?: any[]
    onFailure?: any[]
}

interface LocalStorageGetResult {
    key: string
    value: any
}

interface LocalStorageGetError {
    key: string
    error: string
}

// ===== EFFECTS =====

// AsyncStorage effects
regEffect(EFFECT_IDS.LOCAL_STORAGE_SET, async ({ key, value }: LocalStorageSetPayload) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Failed to save to AsyncStorage:', error)
    }
})

regEffect(EFFECT_IDS.LOCAL_STORAGE_REMOVE, async ({ key }: LocalStorageRemovePayload) => {
    try {
        await AsyncStorage.removeItem(key)
    } catch (error) {
        console.error('Failed to remove from AsyncStorage:', error)
    }
})

// Local data loading effect (replaces fetch for local data)
regEffect(EFFECT_IDS.LOAD_LOCAL_DATA, async ({ dataType, onSuccess, onFailure }: LoadLocalDataPayload) => {
    try {
        let data

        switch (dataType) {
            case 'questions':
                data = questionsData
                break
            case 'vocabulary':
                data = vocabularyData
                break
            default:
                throw new Error(`Unknown data type: ${dataType}`)
        }

        if (onSuccess) {
            dispatch([onSuccess[0], data])
        }
    } catch (error) {
        console.error('Failed to load local data:', error)
        if (onFailure) {
            dispatch([onFailure[0], error instanceof Error ? error.message : String(error)])
        }
    }
})

// Keep original fetch effect for backward compatibility
regEffect(EFFECT_IDS.FETCH, async ({ url, method = 'GET', onSuccess, onFailure }: FetchPayload) => {
    try {
        const response = await fetch(url, { method })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        if (onSuccess) {
            dispatch([onSuccess[0], data])
        }
    } catch (error) {
        console.error('HTTP request failed:', error)
        if (onFailure) {
            dispatch([onFailure[0], error instanceof Error ? error.message : String(error)])
        }
    }
})

regEffect(EFFECT_IDS.SCROLL_TO_TOP, () => {
    setTimeout(() => {
        questionListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, 400);
})

regEffect(EFFECT_IDS.SET_BODY_OVERFLOW, ({ value }: { value: string }) => {
})

regEffect(EFFECT_IDS.SET_BODY_THEME, ({ theme }) => {
})

// ===== CO-EFFECTS =====

// AsyncStorage read effect for mobile
regEffect(EFFECT_IDS.LOCAL_STORAGE_GET, async ({ key, onSuccess, onFailure }: LocalStorageGetPayload) => {
    try {
        const item = await AsyncStorage.getItem(key)
        const value = item ? JSON.parse(item) : null
        if (onSuccess) {
            dispatch([onSuccess[0], { key, value } as LocalStorageGetResult])
        }
    } catch (error) {
        console.error('Failed to read from AsyncStorage:', error)
        if (onFailure) {
            dispatch([onFailure[0], { key, error: error instanceof Error ? error.message : String(error) } as LocalStorageGetError])
        }
    }
}) 
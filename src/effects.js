import { regEffect, regCoeffect, dispatch } from "@flexsurfer/reflex"

// ===== EFFECTS =====

// Local storage effects
regEffect('localStorageSet', ({ key, value }) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Failed to save to localStorage:', error)
    }
})

regEffect('localStorageRemove', ({ key }) => {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error('Failed to remove from localStorage:', error)
    }
})

// Fetch effect
regEffect('fetch', async ({ url, method = 'GET', onSuccess, onFailure }) => {
    try {
        const response = await fetch(url, { method })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        if (onSuccess) {
            dispatch(onSuccess.concat([data]))
        }
    } catch (error) {
        console.error('HTTP request failed:', error)
        if (onFailure) {
            dispatch(onFailure.concat([error.message]))
        }
    }
})

// Scroll effect
regEffect('scrollToTop', () => {
    console.log('scrollToTop')
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
})

// ===== CO-EFFECTS =====

// Local storage co-effect
regCoeffect('localStorageGet', (coeffects, key) => {
    coeffects.localStorage = coeffects.localStorage || {}
    try {
        const item = localStorage.getItem(key)
        coeffects.localStorage[key] = item ? JSON.parse(item) : null
    } catch (error) {
        console.error('Failed to read from localStorage:', error)
        coeffects.localStorage[key] = null
    }
    return coeffects
})
import { regEffect, regCoeffect, dispatch } from "@flexsurfer/reflex"
import { EFFECT_IDS } from 'shared/effect-ids'
import { EVENT_IDS } from 'shared/event-ids'

// ===== EFFECTS =====

// Local storage effects
regEffect(EFFECT_IDS.LOCAL_STORAGE_SET, ({ key, value }) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error('Failed to save to localStorage:', error)
    }
})

regEffect(EFFECT_IDS.LOCAL_STORAGE_REMOVE, ({ key }) => {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error('Failed to remove from localStorage:', error)
    }
})

// Fetch effect
regEffect(EFFECT_IDS.FETCH, async ({ url, method = 'GET', onSuccess, onFailure }) => {
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
regEffect(EFFECT_IDS.SCROLL_TO_TOP, (behavior = 'auto') => {
    window.scrollTo({
        top: 0,
        behavior: behavior
    })
})

regEffect(EFFECT_IDS.CONFIRM_CLEAR, () => {
    if (window.confirm("Are you sure you want to clear ALL your answers?")) {
        dispatch([EVENT_IDS.CLEAR_ANSWERS])
    }
})

regEffect(EFFECT_IDS.SET_BODY_THEME, ({ theme }) => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
})

regEffect(EFFECT_IDS.SET_BODY_OVERFLOW, ({ value }) => {
    document.body.style.overflow = value
})

// ===== CO-EFFECTS =====

// Local storage co-effect
regCoeffect(EFFECT_IDS.LOCAL_STORAGE_GET, (coeffects, key) => {
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
class I18n {
  constructor() {
    this.currentLanguage = 'en'
    this.translations = {}
    this.supportedLanguages = {
      'en': 'English',
      'de': 'Deutsch', 
      'ru': 'Русский',
      'tr': 'Türkçe',
      'ar': 'العربية'
    }
    
    this.init()
  }

  async init() {
    // Detect language from URL, localStorage, or browser preference
    this.currentLanguage = this.detectLanguage()
    
    // Load translations for current language
    await this.loadTranslations(this.currentLanguage)
    
    // Apply translations
    this.applyTranslations()
    
    // Set up language direction for RTL
    this.setLanguageDirection()
    
    // Update URL if needed
    this.updateURL()
  }

  detectLanguage() {
    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const langFromUrl = urlParams.get('lang')
    if (langFromUrl && this.supportedLanguages[langFromUrl]) {
      return langFromUrl
    }

    // 2. Check localStorage
    const savedLang = localStorage.getItem('ebtest-language')
    if (savedLang && this.supportedLanguages[savedLang]) {
      return savedLang
    }

    // 3. Check browser language
    const browserLang = navigator.language.split('-')[0]
    console.log('browserLang', browserLang)
    if (this.supportedLanguages[browserLang]) {
      return browserLang
    }

    // 4. Default to English
    return 'en'
  }

  async loadTranslations(language) {
    try {
      const response = await fetch(`/landing/translations/${language}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load ${language} translations`)
      }
      this.translations = await response.json()
    } catch (error) {
      console.error('Error loading translations:', error)
      
      // Fallback to English if current language fails to load
      if (language !== 'en') {
        try {
          const fallbackResponse = await fetch('/landing/translations/en.json')
          this.translations = await fallbackResponse.json()
          this.currentLanguage = 'en'
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError)
        }
      }
    }
  }

  applyTranslations() {
    // Update document title
    document.title = this.translations.meta.title

    // Update meta tags
    this.updateMetaTag('description', this.translations.meta.description)
    this.updateMetaTag('property', 'og:title', this.translations.meta.ogTitle)
    this.updateMetaTag('property', 'og:description', this.translations.meta.ogDescription) 
    this.updateMetaTag('name', 'twitter:title', this.translations.meta.twitterTitle)
    this.updateMetaTag('name', 'twitter:description', this.translations.meta.twitterDescription)

    // Update page content using data attributes
    this.updateElements()
  }

  updateMetaTag(attribute, value, content) {
    // Two-arg form: updateMetaTag('description', text) targets meta[name="description"]
    const selector = content !== undefined
      ? `meta[${attribute}="${value}"]`
      : `meta[name="${attribute}"]`

    const metaTag = document.querySelector(selector)
    if (metaTag) {
      metaTag.content = content !== undefined ? content : value
    }
  }

  updateElements() {
    // Update elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n')
      const translation = this.getNestedTranslation(key)
      
      if (translation) {
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = translation
        } else {
          element.innerHTML = translation
        }
      }
    })

    // Update elements with data-i18n-title attributes (for tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title')
      const translation = this.getNestedTranslation(key)
      
      if (translation) {
        element.title = translation
      }
    })
  }

  getNestedTranslation(key) {
    const keys = key.split('.')
    let translation = this.translations
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return null
      }
    }
    
    return translation
  }

  setLanguageDirection() {
    const rtlLanguages = ['ar']
    const isRTL = rtlLanguages.includes(this.currentLanguage)
    
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = this.currentLanguage
  }

  updateURL() {
    // Update URL without reloading page
    const url = new URL(window.location)
    
    if (this.currentLanguage !== 'en') {
      url.searchParams.set('lang', this.currentLanguage)
    } else {
      url.searchParams.delete('lang')
    }
    
    window.history.replaceState({}, '', url)
  }

  async switchLanguage(language) {
    if (!this.supportedLanguages[language]) {
      console.error(`Unsupported language: ${language}`)
      return
    }

    this.currentLanguage = language
    
    // Save to localStorage
    localStorage.setItem('ebtest-language', language)
    
    // Load new translations
    await this.loadTranslations(language)
    
    // Apply new translations
    this.applyTranslations()
    
    // Update language direction
    this.setLanguageDirection()
    
    // Update URL
    this.updateURL()

    // Update language selector
    this.updateLanguageSelector()
  }

  updateLanguageSelector() {
    const selector = document.getElementById('language-selector')
    if (selector) {
      selector.value = this.currentLanguage
    }

    // Update button text if using button-based selector
    const selectorBtn = document.getElementById('language-selector-btn')
    if (selectorBtn) {
      selectorBtn.textContent = this.supportedLanguages[this.currentLanguage]
    }
  }

  createLanguageSelector() {
    const selector = document.createElement('select')
    selector.id = 'language-selector'
    selector.className = 'lang-select'
    selector.setAttribute('aria-label', 'Language')

    Object.entries(this.supportedLanguages).forEach(([code, name]) => {
      const option = document.createElement('option')
      option.value = code
      option.textContent = name
      option.selected = code === this.currentLanguage
      selector.appendChild(option)
    })

    selector.addEventListener('change', (e) => {
      this.switchLanguage(e.target.value)
    })

    return selector
  }
}

// Initialize i18n when DOM is loaded and export for global access
document.addEventListener('DOMContentLoaded', function() {
  window.i18n = new I18n()
})

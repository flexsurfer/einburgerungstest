// Test setup file for vitest

// Mock document.body for DOM manipulation tests
Object.defineProperty(document.body, 'style', {
  value: {
    overflow: 'auto'
  },
  writable: true,
  configurable: true
})

// Clear all mocks for each test
beforeEach(() => {
  vi.clearAllMocks()
}) 
import { useState, useEffect, useMemo } from 'react'
import { Dimensions } from 'react-native'

export const useIsTablet = (breakpoint = 600) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'))

    // Listen for dimension changes (rotation)
    useEffect(() => {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setDimensions(window)
      })
    
      return () => subscription?.remove()
    }, [])
    
    // Determine if device is tablet/desktop (width >= 600px)
    const isTabletDevice = useMemo(() => dimensions.width >= breakpoint, [dimensions.width])

    return isTabletDevice
}


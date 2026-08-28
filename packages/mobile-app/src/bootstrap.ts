import { dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from '@ebtest/shared/event-ids'

import '@ebtest/shared/db'
import '@ebtest/shared/events'
import '@ebtest/shared/subs'
import './events'
import './effects'

let isBootstrapped = false

export const bootstrapMobileApp = () => {
  if (isBootstrapped) return

  isBootstrapped = true
  dispatch([EVENT_IDS.INITIALIZE_APP])
}

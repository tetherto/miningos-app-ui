import { Howl } from 'howler'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { getIsAlertEnabled } from '@/app/slices/themeSlice'

const BEEP_SOUND_PARAMS = {
  SOURCE: '/audios/beep.mp3',
  VOLUME: 0.5,
  DELAY_MS: 1_000, // ms
} as const

const OPTIONS_DEFAULT = {
  isAllowed: false,
  volume: BEEP_SOUND_PARAMS.VOLUME,
  delayMs: BEEP_SOUND_PARAMS.DELAY_MS,
} as const

interface UseBeepSoundOptions {
  isAllowed?: boolean
  volume?: number
  delayMs?: number
}

export const useBeepSound = ({
  isAllowed: isAllowedInit = OPTIONS_DEFAULT.isAllowed,
  volume = OPTIONS_DEFAULT.volume,
  delayMs = OPTIONS_DEFAULT.delayMs,
}: UseBeepSoundOptions = OPTIONS_DEFAULT): void => {
  const isAlertEnabled = useSelector(getIsAlertEnabled)

  const isAllowed = isAllowedInit && isAlertEnabled

  const beeper = useRef<Howl | null>(null)

  const ivalHandle = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    const destroyBeeper = (): void => {
      const instance = beeper.current

      if (!instance) {
        return
      }

      if (instance.playing()) {
        instance.pause()
        instance.stop()
      }

      instance.unload()

      beeper.current = null
    }

    const disposeIvalHandle = (): void => {
      if (ivalHandle.current) {
        clearInterval(ivalHandle.current)
        ivalHandle.current = undefined
      }
    }

    disposeIvalHandle()

    destroyBeeper()

    if (!beeper.current && isAllowed) {
      beeper.current = new Howl({
        src: [BEEP_SOUND_PARAMS.SOURCE],
        volume,
      })

      ivalHandle.current = setInterval(() => {
        const instance = beeper.current

        if (!instance) {
          return
        }

        if (instance.playing()) {
          instance.pause()
          instance.stop()
        }

        beeper.current?.play()
      }, delayMs)
    }

    return () => {
      disposeIvalHandle()

      destroyBeeper()
    }
  }, [isAllowed, volume, delayMs])
}

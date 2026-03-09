import { vi } from 'vitest'

vi.mock('howler', () => {
  const MockHowl = vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    unload: vi.fn(),
    playing: () => false,
  }))
  return { Howl: MockHowl }
})

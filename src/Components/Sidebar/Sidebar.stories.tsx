import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { Sidebar } from './Sidebar'

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  decorators: [
    (Story: () => JSX.Element) => (
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <MemoryRouter>
          {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
          <Story />
        </MemoryRouter>
      </div>
    ),
  ],
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
  args: {
    isExpanded: true,
  },
}

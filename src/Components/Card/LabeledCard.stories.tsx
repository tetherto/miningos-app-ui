import type { ComponentType } from 'react'

import LabeledCard from './LabeledCard'
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/LabeledCard',
  component: LabeledCard,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  decorators: [
    (Story: ComponentType) => (
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <Story />
      </div>
    ),
  ],
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
  args: {
    label: 'Card label',
  },
}

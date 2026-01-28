import React from 'react'

import { DATA, PROFIT_DATA } from '../LineChartCard/storiesData'

import LineChartCard from './LineChartCard'
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/LineChartCard',
  component: LineChartCard,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  decorators: [
    (Story: () => React.JSX.Element) => (
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const TwoLines = {
  args: {
    data: DATA,
  },
}

export const ThreeLines = {
  args: {
    data: PROFIT_DATA,
  },
}

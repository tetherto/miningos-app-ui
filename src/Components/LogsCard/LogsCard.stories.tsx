import React from 'react'

import { LOG_TYPES } from './constants'
import LogsCard from './LogsCard'
import { ACTIVITIES_LOGS_DATA, INCIDENTS_LOGS_DATA } from './logsCardStoriesData'
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/LogsCard',
  component: LogsCard,
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
export const Activity = {
  args: {
    logsData: ACTIVITIES_LOGS_DATA,
    type: LOG_TYPES.ACTIVITY,
    label: 'Recent Activity',
  },
}

export const Incidents = {
  args: {
    logsData: INCIDENTS_LOGS_DATA,
    type: LOG_TYPES.INCIDENTS,
    label: 'Active Incidents',
  },
}

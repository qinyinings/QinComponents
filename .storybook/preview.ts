import type { Preview } from '@storybook/react'
import '../src/styles/index.scss'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  argTypes: {
    onClick: { action: 'clicked' },
    onChange: { action: 'changed' },
  },
};

export default preview;
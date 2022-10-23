import { within, userEvent } from "@storybook/testing-library";
import { Story, Meta } from "@storybook/html";
import { createBeaconFeaturePage } from "./BeaconFeature";

export default {
  title: "Example/BeaconFeature",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/html/configure/story-layout
    layout: "fullscreen",
  },
} as Meta;

const Template: Story = () => createBeaconFeaturePage();

export const BeaconFeature = Template.bind({});

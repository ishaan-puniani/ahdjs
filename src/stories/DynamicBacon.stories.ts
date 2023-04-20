import { within, userEvent } from "@storybook/testing-library";
import { Story, Meta } from "@storybook/html";
import { createDynamicBeaconPage } from "./DynamicBacon";

export default {
  title: "Example/DynamicBacon",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/html/configure/story-layout
    layout: "fullscreen",
  },
} as Meta;

const Template1: Story = () => createDynamicBeaconPage();

export const DynamicBacon = Template1.bind({});

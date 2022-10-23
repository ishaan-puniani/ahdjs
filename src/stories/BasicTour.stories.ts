import { within, userEvent } from "@storybook/testing-library";
import { Story, Meta } from "@storybook/html";
import { createBasicTourPage } from "./BasicTour";

export default {
  title: "Example/BasicTour",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/html/configure/story-layout
    layout: "fullscreen",
  },
} as Meta;

const Template: Story = () => createBasicTourPage();

export const BasicTour = Template.bind({});

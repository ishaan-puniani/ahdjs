import { within, userEvent } from "@storybook/testing-library";
import { Story, Meta } from "@storybook/html";
import { createInformationPage } from "./Information";

export default {
  title: "Example/InformationFeature",
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/html/configure/story-layout
    layout: "fullscreen",
  },
} as Meta;

const Template: Story = () => createInformationPage();

export const InformationFeature = Template.bind({});

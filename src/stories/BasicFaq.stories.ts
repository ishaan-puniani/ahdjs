import { within, userEvent } from "@storybook/testing-library";
import { Story, Meta } from "@storybook/html";
import { createBasicFaqPage } from "./BasicFaq";

export default {
  title: "Example/BasicFaq",
  parameters: {
    layout: "fullscreen",
  },
} as Meta;

const Template: Story = () => createBasicFaqPage();

export const BasicFaq = Template.bind({});

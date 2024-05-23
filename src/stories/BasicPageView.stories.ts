import { within, userEvent } from "@storybook/testing-library";
import { Story, Meta } from "@storybook/html";
 import { BasicPageView } from "./BasicPageView";

export default {
  title: "Example/BasicPage",
  parameters: {
    layout: "fullscreen",
  },
} as Meta;

const Template: Story = () => BasicPageView();

export const BasicPage = Template.bind({});

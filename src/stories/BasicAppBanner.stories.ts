 import { Story, Meta } from "@storybook/html";
import { BacicAppBanner } from "./BasicAppBanner";
  
 
export default {
  title: "Example/BasicAppBanner",
  parameters: {
    layout: "fullscreen",
  },
} as Meta;

const Template: Story = () => BacicAppBanner();
 
export const AppBanner = Template.bind({});
 
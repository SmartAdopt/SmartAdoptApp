import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationsPanel } from "./NotificationsPanel";

const meta: Meta<typeof NotificationsPanel> = {
  title: "Organisms/NotificationsPanel",
  component: NotificationsPanel,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof NotificationsPanel>;

export const Default: Story = {};

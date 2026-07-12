// src/components/organisms/NotificationsPanel.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { NotificationsPanel } from "./NotificationsPanel";
import { notificationService } from "../../services/notification.service";
import { MemoryRouter } from "react-router-dom";

const mockNotifications = [
  {
    notification_id: "n-1",
    titulo: "¡Solicitud Aprobada!",
    descripcion:
      "¡Felicidades! Tu solicitud para adoptar a Max ha sido aprobada.",
    fecha: "2026-06-27T10:00:00Z",
    read: false,
    tipo: "approved" as const,
  },
  {
    notification_id: "n-2",
    titulo: "Solicitud Revisada",
    descripcion: "Tu solicitud para adoptar a Luna ha sido revisada.",
    fecha: "2026-06-26T14:30:00Z",
    read: true,
    tipo: "rejected" as const,
  },
];

const mockNotificationsAllRead = [
  {
    notification_id: "n-1",
    titulo: "¡Solicitud Aprobada!",
    descripcion:
      "¡Felicidades! Tu solicitud para adoptar a Max ha sido aprobada.",
    fecha: "2026-06-27T10:00:00Z",
    read: true,
    tipo: "approved" as const,
  },
];

const meta = {
  title: "Organisms/NotificationsPanel",
  component: NotificationsPanel,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#F9FAFB" }],
    },
  },
  decorators: [
    (Story, context) => {
      // Mock notificationService
      const notifications = context.parameters.mockData ?? mockNotifications;
      notificationService.getNotifications = async () => notifications;
      notificationService.getUnreadCount = async () =>
        notifications.filter((n: any) => !n.read).length;
      notificationService.markAsRead = async () => {};
      notificationService.markAllAsRead = async () => {};

      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConNoLeidas: Story = {
  parameters: {
    mockData: mockNotifications,
  },
};

export const TodasLeidas: Story = {
  parameters: {
    mockData: mockNotificationsAllRead,
  },
};

export const Vacio: Story = {
  parameters: {
    mockData: [],
  },
};

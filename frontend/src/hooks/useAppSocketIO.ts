import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

type SocketIOMessage = {
  status?: string;
  application_id?: string;
  [key: string]: unknown;
};

export const useAppSocketIO = (
  onApplicationUpdate?: (data: SocketIOMessage) => void
) => {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [latestMessage, setLatestMessage] = useState<SocketIOMessage | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to Socket.IO server using the VITE_API_URL
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    // Remove the /api part to point to the root where socket.io is mounted
    const baseUrl = apiUrl.replace("/api", "");

    const socket = io(baseUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"], // Fallback to polling if websocket is unavailable
    });

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
    });

    socket.on("application_status_update", (data: SocketIOMessage) => {
      console.log("Socket.IO application_status_update received:", data);

      // We manually add the type here for AdopterLayout compatibility
      const messageWithEvent = { ...data, type: "APPLICATION_STATUS_UPDATE" };
      setLatestMessage(messageWithEvent);

      // Automatically invalidate React Query cache to fetch new status
      queryClient.invalidateQueries({ queryKey: ["adopterRequests"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] }); // Admin applications list

      // Dispatch global event for components not using React Query
      window.dispatchEvent(new CustomEvent("application_status_update"));

      if (onApplicationUpdate) {
        onApplicationUpdate(messageWithEvent);
      }
    });

    socket.on("pet_status_update", (data: SocketIOMessage) => {
      console.log("Socket.IO pet_status_update received:", data);

      const messageWithEvent = { ...data, type: "PET_STATUS_UPDATE" };
      setLatestMessage(messageWithEvent);

      // Invalidate both pet queries so the catalog and feed refresh automatically
      queryClient.invalidateQueries({ queryKey: ["adopterExplorePets"] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["adminRawPets"] }); // Admin pet list
    });

    socket.on("new_pet_registered", (data: SocketIOMessage) => {
      console.log("Socket.IO new_pet_registered received:", data);

      const messageWithEvent = { ...data, type: "NEW_PET_REGISTERED" };
      setLatestMessage(messageWithEvent);

      queryClient.invalidateQueries({ queryKey: ["featuredPets"] });
      queryClient.invalidateQueries({ queryKey: ["adopterExplorePets"] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    });

    socket.on("favorites_update", (data: SocketIOMessage) => {
      console.log("Socket.IO favorites_update received:", data);
      const messageWithEvent = { ...data, type: "FAVORITES_UPDATE" };
      setLatestMessage(messageWithEvent);

      // Invalidate the cache so AdopterFavorites.tsx fetches the updated list
      queryClient.invalidateQueries({ queryKey: ["adopterFavoritesList"] });

      // Dispatch global event for components not using React Query directly
      window.dispatchEvent(
        new CustomEvent("favorites_update", { detail: data })
      );
    });

    socket.on("new_notification", (data: SocketIOMessage) => {
      console.log("Socket.IO new_notification received:", data);
      const messageWithEvent = { ...data, type: "NEW_NOTIFICATION" };
      setLatestMessage(messageWithEvent);

      window.dispatchEvent(
        new CustomEvent("new_notification", { detail: data })
      );
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient, onApplicationUpdate]);

  return { latestMessage };
};

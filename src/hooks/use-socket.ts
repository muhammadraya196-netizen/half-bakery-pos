"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket, onSocketEvent } from "@/lib/socket";
import type { SocketEvent } from "@/types";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) setIsConnected(true);

    const unsubOrder = onSocketEvent("order:created", (event) => {
      setLastEvent(event);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    });

    const unsubProduct = onSocketEvent("product:updated", (event) => {
      setLastEvent(event);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      unsubOrder();
      unsubProduct();
      disconnectSocket();
    };
  }, [queryClient]);

  return { isConnected, lastEvent };
}

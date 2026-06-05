"use client";

import { useSocket } from "@/hooks/use-socket";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useSocket();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        <Badge
          variant={isConnected ? "success" : "secondary"}
          className="flex items-center gap-1.5 px-3 py-1.5 shadow-md"
        >
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              Realtime aktif
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Offline mode
            </>
          )}
        </Badge>
      </div>
    </>
  );
}

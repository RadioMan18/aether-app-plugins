import { useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PluginManifest } from "@/types/plugin";

interface PluginSandboxProps {
  src: string;
  title: string;
  plugin: PluginManifest;
}

export function PluginSandbox({ src, title, plugin }: PluginSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = async (event: MessageEvent) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type !== "aether:request") return;

      const { requestId, payload } = message;

      try {
        const response = await invoke<PluginResponse>("plugin_ipc", {
          plugin_id: plugin.id,
          request: {
            id: requestId,
            plugin_id: plugin.id,
            request_type: payload.type,
            payload: payload.params || {},
          },
        });

        iframe.contentWindow?.postMessage(
          {
            type: "aether:response",
            requestId,
            result: response,
          },
          "*"
        );
      } catch (error) {
        iframe.contentWindow?.postMessage(
          {
            type: "aether:response",
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "*"
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [plugin.id]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      sandbox="allow-scripts"
      className="h-full w-full border-0 bg-canvas"
      allow="clipboard-write"
    />
  );
}

interface PluginResponse {
  id: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

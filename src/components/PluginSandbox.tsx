import { useMemo } from "react";

interface PluginSandboxProps {
  src: string;
  title: string;
}

export function PluginSandbox({ src, title }: PluginSandboxProps) {
  const srcdoc = useMemo(() => {
    if (!src) {
      return `<!DOCTYPE html><html><body style="font-family: system-ui; background: #111214; color: #f0f0f0; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;"><p>Plugin not configured.</p></body></html>`;
    }
    return undefined;
  }, [src]);

  return (
    <iframe
      src={src}
      title={title}
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      className="h-full w-full border-0 bg-canvas"
      allow="clipboard-write"
    />
  );
}

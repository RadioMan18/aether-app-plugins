import { cn } from "@/lib/utils";

interface MainContentProps {
  className?: string;
  children?: React.ReactNode;
}

export function MainContent({ className, children }: MainContentProps) {
  return (
    <main className={cn("flex-1 overflow-y-auto scrollbar-thin bg-canvas", className)}>
      {children ?? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-semibold text-text-primary">
              Welcome to Aether
            </h1>
            <p className="text-text-secondary">
              Select a plugin from the Activity Bar to get started.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

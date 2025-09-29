"use client";

import MainPanel from "@/components/ar-code-weaver/main-panel";
import { FirebaseClientProvider } from "@/firebase";
import { Logo } from "@/components/icons";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        <Button onClick={resetErrorBoundary} className="mt-4">
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex items-center justify-center gap-3">
          <Logo className="h-16 w-16" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Animate Code viewer
          </h1>
        </header>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <FirebaseClientProvider>
            <MainPanel />
          </FirebaseClientProvider>
        </ErrorBoundary>
      </div>
    </main>
  );
}

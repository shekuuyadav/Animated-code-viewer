
import ARViewer from "@/components/ar-code-weaver/ar-viewer";
import ARViewerWithFirestoreImage from "@/components/ar-code-weaver/ar-viewer-with-firestore-image";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FirebaseClientProvider } from "@/firebase";

function ARDisplayContent({
  imageUrl,
  imageId,
  message,
}: {
  imageUrl?: string;
  imageId?: string;
  message?: string;
}) {
  if (!message || (!imageUrl && !imageId)) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-destructive">
        <h1 className="text-2xl font-bold">Invalid QR Code</h1>
        <p>Image or message is missing. Please generate a new code.</p>
      </div>
    );
  }

  if (imageId) {
    return <ARViewerWithFirestoreImage imageId={imageId} message={message} />;
  }

  if (imageUrl) {
    return <ARViewer imageUrl={imageUrl} message={message} />;
  }

  return null; // Should not happen given the check above
}

export default function DisplayPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const imageUrl = Array.isArray(searchParams.imageUrl)
    ? searchParams.imageUrl[0]
    : searchParams.imageUrl;
  const imageId = Array.isArray(searchParams.imageId)
    ? searchParams.imageId[0]
    : searchParams.imageId;
    const message = Array.isArray(searchParams.message)
    ? searchParams.message[0]
    : searchParams.message;


  return (
    <main className="flex h-full min-h-screen w-full items-center justify-center bg-gray-900 p-4">
      <FirebaseClientProvider>
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-[300px] w-[300px] rounded-lg bg-gray-800" />
              <Skeleton className="h-8 w-64 rounded-md bg-gray-800" />
            </div>
          }
        >
          <ARDisplayContent imageUrl={imageUrl} imageId={imageId} message={message} />
        </Suspense>
      </FirebaseClientProvider>
    </main>
  );
}

// Force dynamic rendering to access searchParams
export const dynamic = "force-dynamic";

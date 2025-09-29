"use client";

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import ARViewer from "./ar-viewer";
import { doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

type ImageDoc = {
  url: string;
};

export default function ARViewerWithFirestoreImage({
  imageId,
  message,
}: {
  imageId: string;
  message: string;
}) {
  const firestore = useFirestore();

  const imageDocRef = useMemoFirebase(
    () => (firestore && imageId ? doc(firestore, "images", imageId) : null),
    [firestore, imageId]
  );
  
  const { data: imageDoc, isLoading, error } = useDoc<ImageDoc>(imageDocRef);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-[300px] w-[300px] rounded-lg bg-gray-800" />
        <Skeleton className="h-8 w-64 rounded-md bg-gray-800" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load the image from the database. It may have been deleted.
        </AlertDescription>
      </Alert>
    )
  }

  if (!imageDoc) {
    return (
      <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
        <AlertTitle>Image not found</AlertTitle>
        <AlertDescription>
          The requested image could not be found in the database.
        </AlertDescription>
      </Alert>
    )
  }

  return <ARViewer imageUrl={imageDoc.url} message={message} />;
}

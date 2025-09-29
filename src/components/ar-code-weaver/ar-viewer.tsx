"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ARViewer = ({ imageUrl, message }: { imageUrl: string; message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <style jsx>{`
        .ar-container {
          perspective: 1000px;
        }
        .ar-image-wrapper {
          transform-style: preserve-3d;
          animation: spin 20s infinite linear;
        }
        @keyframes spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
      <div className="ar-container">
        <div className="ar-image-wrapper">
          <Card className="overflow-hidden border-2 border-primary/50 bg-transparent shadow-2xl shadow-primary/20">
            <Image
              src={imageUrl}
              alt="AR Content"
              width={300}
              height={300}
              className="object-cover"
              priority
            />
          </Card>
        </div>
      </div>
      <p className="max-w-md rounded-md bg-black/60 p-4 text-center text-xl font-medium text-white backdrop-blur-md">
        {message}
      </p>
    </div>
  );
};

export default ARViewer;

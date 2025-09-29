"use client";

import { useState, useMemo, useEffect, useRef, DragEvent } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from "@/lib/placeholder-images";
import { rewriteTextForAR } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

const steps = [
  { id: 1, name: "Choose Image" },
  { id: 2, name: "Write Message" },
  { id: 3, name: "Generate Code" },
];

const colors = [
  { name: "Violet", hex: "#673AB7" },
  { name: "Blue", hex: "#03A9F4" },
  { name: "Black", hex: "#000000" },
  { name: "Red", hex: "#F44336" },
  { name: "Green", hex: "#4CAF50" },
  { name: "Orange", hex: "#FF9800" },
];

export default function MainPanel() {
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<ImagePlaceholder | null>(
    null
  );
  const [userMessage, setUserMessage] = useState(
    "Happy Birthday! Hope you have a great day."
  );
  const [aiMessage, setAiMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");
  const [qrColor, setQrColor] = useState(colors[0].hex);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isQrLoading, setIsQrLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isUploadedImage = selectedImage?.id === "uploaded";

  useEffect(() => {
    if (step === 3 && selectedImage && finalMessage) {
      setIsQrLoading(true);
      const origin = window.location.origin;

      let url = `${origin}/display?message=${encodeURIComponent(
        finalMessage
      )}`;
      if (isUploadedImage) {
        url += `&imageId=${encodeURIComponent(selectedImage.description)}`;
      } else {
        url += `&imageUrl=${encodeURIComponent(selectedImage.imageUrl)}`;
      }

      QRCode.toDataURL(url, {
        color: {
          dark: qrColor,
          light: "#FFFFFF",
        },
        width: 256,
        margin: 2,
      })
        .then((dataUrl) => {
          setQrCodeUrl(dataUrl);
        })
        .catch((err) => {
          console.error(err);
          toast({
            variant: "destructive",
            title: "QR Code Error",
            description: "Could not generate QR code.",
          });
        })
        .finally(() => {
          setIsQrLoading(false);
        });
    }
  }, [step, selectedImage, finalMessage, qrColor, toast, isUploadedImage]);

  const handleAiRewrite = async () => {
    if (!userMessage || !selectedImage) return;
    setIsAiLoading(true);
    setAiMessage("");
    const result = await rewriteTextForAR({
      text: userMessage,
      imageDescription: selectedImage.description,
    });
    setIsAiLoading(false);
    if (result.success && result.data) {
      setAiMessage(result.data.rewrittenText);
    } else {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: result.error,
      });
    }
  };

  const processFile = (file: File) => {
    if (user) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 4MB.",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        if (firestore && user) {
          const imageColRef = collection(firestore, "images");
          addDocumentNonBlocking(
            imageColRef,
            {
              fileName: file.name,
              url: imageUrl,
              userId: user.uid,
              uploadedAt: serverTimestamp(),
            }
          ).then(docRef => {
            if (docRef) {
              // Store the Firestore-generated ID
              setSelectedImage({
                id: "uploaded",
                imageUrl: imageUrl,
                description: docRef.id, 
                imageHint: "uploaded file",
              });
              setStep(2);
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const selectMessage = (message: string) => {
    setFinalMessage(message);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setSelectedImage(null);
    setUserMessage("Happy Birthday! Hope you have a great day.");
    setAiMessage("");
    setFinalMessage("");
    setQrColor(colors[0].hex);
    setQrCodeUrl("");
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((s, index) => (
              <li
                key={s.name}
                className={cn("relative", {
                  "pr-8 sm:pr-20": index < steps.length - 1,
                })}
              >
                {step > s.id ? (
                  <>
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="h-0.5 w-full bg-primary" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">{s.name}</span>
                    </div>
                  </>
                ) : step === s.id ? (
                  <>
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="sr-only">{s.name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background" />
                    <span className="sr-only">{s.name}</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        {step === 1 && (
          <div>
            <CardTitle>1. Choose an Image</CardTitle>
            <CardDescription className="mb-4">
              Select an image from the list, or drag and drop your own.
            </CardDescription>

            <div
              className={cn(
                "relative mb-4 rounded-lg border-2 border-dashed border-border p-4 transition-colors",
                {
                  "border-primary bg-primary/10": isDragging,
                }
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  disabled={isUserLoading || !user}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUserLoading || !user}
                >
                  <Upload />
                  Upload Image
                </Button>
                <p className="text-sm">or drag and drop a file here</p>
                {isDragging && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              {isUserLoading && (
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Authenticating...
                </p>
              )}
              {!user && !isUserLoading && (
                <p className="mt-2 text-center text-sm text-destructive">
                  Please wait for anonymous sign-in to complete before
                  uploading.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {PlaceHolderImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setSelectedImage(image);
                    setStep(2);
                  }}
                  className="group relative block w-full overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    width={200}
                    height={200}
                    className="aspect-square h-full w-full object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedImage && (
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <CardTitle>2. Write Your Message</CardTitle>
              <CardDescription className="mb-4">
                This text will appear in the AR view.
              </CardDescription>
              <div className="relative mb-4">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.description}
                  width={300}
                  height={300}
                  className="aspect-square w-full rounded-lg object-cover"
                  data-ai-hint={selectedImage.imageHint}
                />
              </div>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft /> Back
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-message">Your Message</Label>
                <Textarea
                  id="user-message"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={4}
                />
              </div>
              <Button
                onClick={handleAiRewrite}
                disabled={isAiLoading || !userMessage || isUploadedImage}
              >
                {isAiLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                Refine with AI
              </Button>
              {isUploadedImage && (
                <p className="text-sm text-muted-foreground">
                  AI refinement is not available for uploaded images.
                </p>
              )}
              {isAiLoading && (
                <p className="text-sm text-muted-foreground">
                  AI is thinking...
                </p>
              )}
              {aiMessage && (
                <div className="space-y-2 rounded-md border bg-secondary/50 p-4">
                  <Label>AI Suggestion</Label>
                  <p className="text-sm text-secondary-foreground">
                    {aiMessage}
                  </p>
                </div>
              )}
              <CardFooter className="flex justify-end gap-2 p-0 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => selectMessage(userMessage)}
                  disabled={!userMessage}
                >
                  Use Original
                </Button>
                <Button
                  onClick={() => selectMessage(aiMessage)}
                  disabled={!aiMessage}
                >
                  Use AI <ChevronRight />
                </Button>
              </CardFooter>
            </div>
          </div>
        )}

        {step === 3 && selectedImage && finalMessage && (
          <div className="grid items-start gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <CardTitle>3. Customize & Share</CardTitle>
              <CardDescription className="mb-4">
                Scan this QR code on your device to see the AR experience.
              </CardDescription>

              <div className="space-y-2">
                <h4 className="font-medium">Image:</h4>
                <div className="flex items-center gap-4">
                  <Image
                    src={selectedImage.imageUrl}
                    alt={selectedImage.description}
                    width={64}
                    height={64}
                    className="aspect-square rounded-md object-cover"
                  />
                  <p className="flex-1 text-sm text-muted-foreground">
                    {isUploadedImage ? `Uploaded Image (${selectedImage.description.substring(0,8)}...)` : selectedImage.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                <h4 className="font-medium">Message:</h4>
                <p className="text-sm italic text-muted-foreground">
                  "{finalMessage}"
                </p>
              </div>

              <div>
                <Label>QR Code Color</Label>
                <div className="mt-2 flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setQrColor(color.hex)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        qrColor === color.hex
                          ? "scale-110 border-primary ring-2 ring-primary/50"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Set color to ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-gray-100 p-6">
              {isQrLoading || !qrCodeUrl ? (
                <Skeleton className="h-64 w-64" />
              ) : (
                <Image
                  src={qrCodeUrl}
                  alt="Generated QR Code"
                  width={256}
                  height={256}
                  className="rounded-lg shadow-md"
                />
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft /> Back
                </Button>
                {qrCodeUrl && !isQrLoading && (
                  <Button asChild>
                    <a href={qrCodeUrl} download="ar-code-weaver-qr.png">
                      <Download /> Download
                    </a>
                  </Button>
                )}
                <Button variant="destructive" onClick={reset}>
                  <RefreshCcw /> Start Over
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

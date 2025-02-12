"use client";

import { Artwork } from "@/lib/types";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
}

export function ArtworkModal({ artwork, onClose }: ArtworkModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = artwork.artwork_images || [];
  const hasMultipleImages = images.length > 1;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1,
        );
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1,
        );
      }
    };

    if (hasMultipleImages) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [hasMultipleImages, images.length]);

  if (!images[0]) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white hover:opacity-75"
      >
        <X size={24} />
      </button>

      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        {/* Main Image Container */}
        <div className="relative h-[calc(100vh-8rem)] max-w-[90vw]">
          <Image
            src={images[currentImageIndex].url}
            alt={artwork.title || "Artwork"}
            width={1200}
            height={800}
            quality={100}
            className="h-full w-auto max-w-[90vw] object-contain"
            priority
          />

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white">
            <h3 className="text-lg font-medium">
              {artwork.title || "Untitled"}, {artwork.year}
            </h3>
            <p className="mt-1 text-sm text-white/80">
              {artwork.medium}, {artwork.height}"H x {artwork.width}"W
            </p>
          </div>
        </div>

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.url}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex
                    ? "border-white"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

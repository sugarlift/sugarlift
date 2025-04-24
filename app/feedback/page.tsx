"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Artwork } from "@/lib/types";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, Heart, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeedbackPage() {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [nextArtwork, setNextArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const artworksCache = useRef<Artwork[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Track which artworks we've already seen to avoid duplicates
  const seenArtworkIds = useRef<Set<string>>(new Set());
  // Track which artworks have been rated (persistent across sessions)
  const ratedArtworkIds = useRef<Set<string>>(new Set());
  // Track the current page for pagination
  const currentPage = useRef<number>(0);
  // Track if we've seen all artworks
  const hasMoreArtworks = useRef<boolean>(true);
  // Track which button was pressed
  const [pressedButton, setPressedButton] = useState<
    "dislike" | "like" | "love" | null
  >(null);
  // Track the number of votes in the current session
  const votesCount = useRef<number>(0);
  // Track prefetched image URLs to avoid duplicate prefetching
  const prefetchedImageUrls = useRef<Set<string>>(new Set());
  // Store prefetched images for rendering
  const [prefetchedImages, setPrefetchedImages] = useState<string[]>([]);
  // Track if we're in the middle of a transition
  const isTransitioning = useRef<boolean>(false);
  // Prefetch batch size - increased for faster loading
  const PREFETCH_BATCH_SIZE = 20;
  // State for info tooltip
  const [infoOpen, setInfoOpen] = useState(false);
  // State for showing keyboard shortcuts
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Load rated artwork IDs from localStorage on initial render
  useEffect(() => {
    try {
      const storedRatedArtworks = localStorage.getItem("ratedArtworkIds");
      if (storedRatedArtworks) {
        const parsedIds = JSON.parse(storedRatedArtworks);
        ratedArtworkIds.current = new Set(parsedIds);
      }
    } catch (error) {
      console.error("Error loading rated artworks from localStorage:", error);
    }
  }, []);

  // Prefetch images for faster loading
  const prefetchImages = useCallback(
    (artworks: Artwork[], priority = false) => {
      if (!artworks || artworks.length === 0) return;

      const imagesToPrefetch = artworks
        .filter(
          (art) =>
            art.artwork_images?.[0]?.url &&
            !prefetchedImageUrls.current.has(
              art.artwork_images[0].url as string,
            ),
        )
        .map((art) => art.artwork_images[0].url as string);

      if (imagesToPrefetch.length === 0) return;

      // Add to prefetched set to avoid duplicates
      imagesToPrefetch.forEach((url) => prefetchedImageUrls.current.add(url));

      // Update state to render the preload links
      setPrefetchedImages((prev) => [...prev, ...imagesToPrefetch]);

      // For high priority images, also preload them with Image component
      if (priority) {
        // Use Promise.all to load images in parallel
        Promise.all(
          imagesToPrefetch.map((url) => {
            return new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                // Mark this image as fully loaded in browser cache
                try {
                  const fullyLoadedImages = new Set(
                    JSON.parse(
                      sessionStorage.getItem("fullyLoadedImages") || "[]",
                    ),
                  );
                  fullyLoadedImages.add(url);
                  sessionStorage.setItem(
                    "fullyLoadedImages",
                    JSON.stringify([...fullyLoadedImages]),
                  );
                  resolve();
                } catch (error) {
                  console.error("Error updating sessionStorage:", error);
                  resolve();
                }
              };
              img.onerror = () => resolve(); // Still resolve on error
              img.src = url;
            });
          }),
        ).catch(() => {
          // Silently catch any errors in image loading
        });
      }
    },
    [],
  );

  // Check if an image is fully loaded in browser cache
  const isImageFullyLoaded = useCallback((url: string) => {
    try {
      const fullyLoadedImages = new Set(
        JSON.parse(sessionStorage.getItem("fullyLoadedImages") || "[]"),
      );
      return fullyLoadedImages.has(url);
    } catch {
      return false;
    }
  }, []);

  // Show the next artwork from the cache
  const showNextArtwork = useCallback(() => {
    // Prevent multiple transitions at once
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    setLoading(true);

    // If we're running low on cached artworks, fetch more
    if (artworksCache.current.length < PREFETCH_BATCH_SIZE) {
      fetchArtworks();
    }

    // Get the next artwork from the cache
    const nextArt = artworksCache.current.shift();

    if (nextArt) {
      // Check if the image is already cached before showing loading spinner
      if (nextArt.artwork_images?.[0]?.url) {
        const imageUrl = nextArt.artwork_images[0].url as string;

        // Check if image is already in browser cache
        if (
          prefetchedImageUrls.current.has(imageUrl) &&
          isImageFullyLoaded(imageUrl)
        ) {
          // If it's in our prefetched set and fully loaded, skip the loading state
          setImageLoaded(true);
        } else {
          // Otherwise, show loading state
          setImageLoaded(false);
        }
      } else {
        setImageLoaded(false);
      }

      setArtwork(nextArt);

      // Preload the next artwork if available
      if (artworksCache.current.length > 0) {
        setNextArtwork(artworksCache.current[0]);
      }

      setLoading(false);

      // Reset transition flag after a short delay
      setTimeout(() => {
        isTransitioning.current = false;
      }, 50);
    } else {
      // If we somehow don't have any artworks, fetch more
      fetchArtworks();
      isTransitioning.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImageFullyLoaded]);

  // Fetch a batch of artworks and cache them
  const fetchArtworks = useCallback(async () => {
    try {
      // If we've already seen all artworks, reset and start over
      if (!hasMoreArtworks.current) {
        currentPage.current = 0;
        seenArtworkIds.current.clear();
        hasMoreArtworks.current = true;
      }

      const pageSize = 500;
      const pageOffset = currentPage.current * pageSize;

      // Get artworks that are live in production with pagination
      const { data: artworks } = await supabase
        .from("artwork")
        .select("*")
        .eq("live_in_production", true)
        .range(pageOffset, pageOffset + pageSize - 1);

      if (artworks && artworks.length > 0) {
        // Filter out artworks we've already seen in this session OR have rated in any session
        const newArtworks = artworks.filter(
          (art) =>
            !seenArtworkIds.current.has(art.id) &&
            !ratedArtworkIds.current.has(art.id),
        );

        // If we got fewer new artworks than expected, we might be running out
        if (newArtworks.length < pageSize / 2) {
          // Try the next page next time
          currentPage.current += 1;
        }

        // If we got no new artworks, we've probably seen them all
        if (newArtworks.length === 0) {
          if (artworksCache.current.length === 0) {
            // We've seen all artworks, reset for next time
            hasMoreArtworks.current = false;
            // Try again with reset values
            fetchArtworks();
            return;
          }
        } else {
          // Mark these artworks as seen
          newArtworks.forEach((art) => seenArtworkIds.current.add(art.id));

          // Shuffle the new artworks and add to cache
          const shuffledArtworks = [...newArtworks].sort(
            () => Math.random() - 0.5,
          );
          artworksCache.current = [
            ...artworksCache.current,
            ...shuffledArtworks,
          ];

          // Prefetch the first batch of images if this is the initial load
          if (!artwork) {
            prefetchImages(
              artworksCache.current.slice(0, PREFETCH_BATCH_SIZE),
              true,
            );
          }
        }

        // Set the first artwork if we don't have one yet
        if (!artwork) {
          showNextArtwork();
        }
      } else {
        // No artworks returned, try the next page
        currentPage.current += 1;

        // If we've gone through many pages with no results, we might have seen everything
        if (currentPage.current > 500 && artworksCache.current.length === 0) {
          hasMoreArtworks.current = false;
        }

        // If we still have cached artworks, continue showing them
        if (artworksCache.current.length === 0) {
          fetchArtworks();
        }
      }
    } catch (error) {
      console.error("Error fetching artworks:", error);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRating = useCallback(
    async (ratingType: "like" | "dislike" | "love") => {
      if (!artwork || isTransitioning.current) return;

      // Store the current artwork ID for the API call
      const currentArtworkId = artwork.id;

      // Set the pressed button to show visual feedback
      setPressedButton(ratingType);

      // Show visual feedback for a very short time (50ms is enough for users to perceive)
      setTimeout(() => {
        setPressedButton(null);
      }, 50);

      // Immediately show the next artwork without waiting for the API call
      showNextArtwork();

      // Increment vote count right away
      votesCount.current += 1;

      // Strategic prefetching based on vote count - do this immediately
      if (votesCount.current % 5 === 0) {
        // Prefetch every 5 votes to keep the cache fresh
        prefetchImages(artworksCache.current.slice(0, PREFETCH_BATCH_SIZE));
      }

      try {
        // Add the artwork ID to the rated set immediately for better UX
        ratedArtworkIds.current.add(currentArtworkId);

        // Update localStorage with the new rated artwork
        try {
          localStorage.setItem(
            "ratedArtworkIds",
            JSON.stringify([...ratedArtworkIds.current]),
          );
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }

        // Use the server-side API to update the rating
        const response = await fetch("/api/artwork/rate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artworkId: currentArtworkId,
            ratingType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error updating rating:", errorData);
        }
      } catch (error) {
        console.error("Error submitting rating:", error);
      }
    },
    [artwork, showNextArtwork, prefetchImages],
  );

  // Fetch artworks when the page loads
  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // Add keyboard shortcut support with optimized handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only check if image is loaded, not if submitting
      // This allows keyboard shortcuts to work even while a previous rating is being submitted
      if (loading || !imageLoaded) return;

      switch (e.key) {
        case "1":
          handleRating("dislike");
          break;
        case "2":
          handleRating("like");
          break;
        case "3":
          handleRating("love");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [loading, imageLoaded, handleRating]);

  // Initialize the fully loaded images from sessionStorage on mount
  useEffect(() => {
    try {
      // Initialize the sessionStorage for fully loaded images if it doesn't exist
      if (!sessionStorage.getItem("fullyLoadedImages")) {
        sessionStorage.setItem("fullyLoadedImages", JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error accessing sessionStorage:", error);
    }
  }, []);

  if (loading && !artwork) {
    return (
      <div className="flex min-h-screen items-center justify-center"></div>
    );
  }

  if (!artwork || !artwork.artwork_images?.[0]?.url) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">No artwork available</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <style jsx global>{`
        /* Hide any footer that might be showing */
        footer,
        nav {
          display: none !important;
        }
        html,
        body {
          overflow: hidden;
        }
        /* Optimize rendering performance */
        * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          transform: translateZ(0);
          will-change: transform, opacity;
        }
      `}</style>

      {/* Mobile info button - positioned at top right */}
      <div className="fixed right-4 top-4 z-50 sm:hidden">
        <Button
          onClick={() => setInfoOpen(!infoOpen)}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm"
          aria-label="Information"
        >
          <Info className="h-5 w-5" />
        </Button>

        {infoOpen && (
          <div className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium">About This Page</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setInfoOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              This page allows you to rate artworks to help us understand your
              preferences. Your feedback helps us curate better art
              recommendations for you.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-xs text-gray-500">
                Show keyboard shortcuts
              </span>
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showKeyboardShortcuts ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showKeyboardShortcuts ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content container with padding */}
      <div className="flex w-full max-w-[1440px] flex-grow items-center justify-center px-4 lg:px-24">
        {/* Image container with calculated height */}
        <div className="relative mt-[-113px] h-[calc(100vh-16rem)] w-full">
          {/* Current artwork image */}
          {artwork && artwork.artwork_images?.[0]?.url && (
            <Image
              src={artwork.artwork_images[0].url as string}
              alt="Artwork"
              fill
              className={`duration-50 object-contain transition-opacity ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
              priority
              quality={50}
              onLoadingComplete={() => {
                setImageLoaded(true);

                // Mark this image as fully loaded in browser cache
                try {
                  const fullyLoadedImages = new Set(
                    JSON.parse(
                      sessionStorage.getItem("fullyLoadedImages") || "[]",
                    ),
                  );
                  fullyLoadedImages.add(
                    artwork.artwork_images[0].url as string,
                  );
                  sessionStorage.setItem(
                    "fullyLoadedImages",
                    JSON.stringify([...fullyLoadedImages]),
                  );
                } catch (error) {
                  console.error("Error updating sessionStorage:", error);
                }
              }}
              loading="eager"
              unoptimized={true}
            />
          )}

          {/* Loading indicator - only show if not already loaded */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600"></div>
            </div>
          )}

          {/* Preload next image */}
          {nextArtwork && nextArtwork.artwork_images?.[0]?.url && (
            <link
              rel="preload"
              as="image"
              href={nextArtwork.artwork_images[0].url as string}
              fetchPriority="high"
            />
          )}

          {/* Preload batch of images - use picture elements for better browser support */}
          <div className="hidden">
            {prefetchedImages.map((url, index) => (
              <picture key={`preload-picture-${index}`}>
                <img
                  key={`hidden-img-${index}`}
                  src={url}
                  alt=""
                  aria-hidden="true"
                  onLoad={() => {
                    // Mark as fully loaded when the hidden image loads
                    try {
                      const fullyLoadedImages = new Set(
                        JSON.parse(
                          sessionStorage.getItem("fullyLoadedImages") || "[]",
                        ),
                      );
                      fullyLoadedImages.add(url);
                      sessionStorage.setItem(
                        "fullyLoadedImages",
                        JSON.stringify([...fullyLoadedImages]),
                      );
                    } catch (error) {
                      console.error("Error updating sessionStorage:", error);
                    }
                  }}
                />
              </picture>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-3 items-center bg-white px-4 pb-8 pt-8 sm:px-8">
        {/* Empty left column for balance */}
        <div className="hidden sm:block"></div>

        {/* Rating buttons container - center column */}
        <div className="col-span-3 flex justify-center gap-4 sm:col-span-1">
          <Button
            onClick={() => handleRating("dislike")}
            disabled={!imageLoaded}
            variant="outline"
            className={`flex h-12 w-[200px] max-w-[30vw] items-center justify-center gap-2 rounded-md border transition-all ${
              showKeyboardShortcuts ? "sm:justify-between" : "sm:justify-center"
            } ${
              pressedButton === "dislike"
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <ThumbsDown
                className={`h-5 w-5 ${pressedButton === "dislike" ? "text-red-500" : ""}`}
              />
              <span className="hidden sm:inline">Dislike</span>
            </div>
            {showKeyboardShortcuts && (
              <kbd className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 sm:inline-block">
                1
              </kbd>
            )}
          </Button>

          <Button
            onClick={() => handleRating("like")}
            disabled={!imageLoaded}
            variant="outline"
            className={`flex h-12 w-[200px] max-w-[30vw] items-center justify-center gap-2 rounded-md border transition-all ${
              showKeyboardShortcuts ? "sm:justify-between" : "sm:justify-center"
            } ${
              pressedButton === "like"
                ? "border-green-500 bg-green-50 text-green-600"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <ThumbsUp
                className={`h-5 w-5 ${pressedButton === "like" ? "text-green-500" : ""}`}
              />
              <span className="hidden sm:inline">Like</span>
            </div>
            {showKeyboardShortcuts && (
              <kbd className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 sm:inline-block">
                2
              </kbd>
            )}
          </Button>

          <Button
            onClick={() => handleRating("love")}
            disabled={!imageLoaded}
            variant="outline"
            className={`flex h-12 w-[200px] max-w-[30vw] items-center justify-center gap-2 rounded-md border transition-all ${
              showKeyboardShortcuts ? "sm:justify-between" : "sm:justify-center"
            } ${
              pressedButton === "love"
                ? "border-pink-500 bg-pink-50 text-pink-600"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart
                className={`h-5 w-5 ${pressedButton === "love" ? "text-pink-500" : ""}`}
              />
              <span className="hidden sm:inline">Love</span>
            </div>
            {showKeyboardShortcuts && (
              <kbd className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 sm:inline-block">
                3
              </kbd>
            )}
          </Button>
        </div>

        {/* Empty right column on mobile, info button on desktop */}
        <div className="hidden sm:flex sm:justify-end">
          <div className="relative">
            <Button
              onClick={() => setInfoOpen(!infoOpen)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              aria-label="Information"
            >
              <Info className="h-5 w-5" />
            </Button>

            {infoOpen && (
              <div className="absolute bottom-12 right-0 z-50 w-96 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium">About this tool</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setInfoOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  This page allows you to rate artworks to help Sugarlift
                  understand your preferences. Your feedback helps us curate
                  better art recommendations for you.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="mt-2 text-sm text-gray-500">
                    Show keyboard shortcuts
                  </span>
                  <button
                    onClick={() =>
                      setShowKeyboardShortcuts(!showKeyboardShortcuts)
                    }
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showKeyboardShortcuts ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showKeyboardShortcuts
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

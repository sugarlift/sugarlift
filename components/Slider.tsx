"use client";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ReactNode } from "react";
import { useEffect, useState } from "react";
import { KeenSliderInstance } from "keen-slider";

interface SliderProps {
  children: ReactNode;
  slidesPerView?: number;
  spacing?: number;
  mobileSpacing?: number;
}

const WheelControls = (slider: KeenSliderInstance) => {
  let touchTimeout: NodeJS.Timeout;
  let position: { x: number; y: number };
  let wheelActive: boolean;
  const dispatch = (e: WheelEvent, name: string) => {
    position.x -= e.deltaX;
    position.y -= e.deltaY;
    slider.container.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          x: position.x,
          y: position.y,
        },
      }),
    );
  };
  const wheelStart = (e: WheelEvent) => {
    position = {
      x: e.pageX,
      y: e.pageY,
    };
    dispatch(e, "ksDragStart");
  };
  const wheel = (e: WheelEvent) => {
    dispatch(e, "ksDrag");
  };
  const wheelEnd = (e: WheelEvent) => {
    dispatch(e, "ksDragEnd");
  };
  const eventWheel = (e: WheelEvent) => {
    // Prevent hijacking scrolling if user is scrolling down on the page
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (!wheelActive) {
        wheelStart(e);
        wheelActive = true;
      }
      wheel(e);
      clearTimeout(touchTimeout);
      touchTimeout = setTimeout(() => {
        wheelActive = false;
        wheelEnd(e);
      }, 50);
    }
  };
  slider.on("created", () => {
    slider.container.addEventListener("wheel", eventWheel, {
      passive: false,
    });
  });
};

// Add a custom hook for responsive behavior
function useWindowWidth() {
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    // Set initial width
    setWidth(window?.innerWidth ?? 0);
    // Handle resize
    function handleResize() {
      setWidth(window?.innerWidth ?? 0);
    }
    window?.addEventListener("resize", handleResize);
    return () => window?.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

export function Slider({
  children,
  slidesPerView = 1,
  spacing = 16,
  mobileSpacing = 12,
}: SliderProps) {
  const windowWidth = useWindowWidth();
  const [isLoaded, setIsLoaded] = useState(false);

  const [sliderRef] = useKeenSlider(
    {
      slides: {
        perView: slidesPerView,
        spacing: windowWidth < 768 ? mobileSpacing : spacing,
      },
      dragSpeed: 1,
      rubberband: true,
      defaultAnimation: {
        duration: 500,
      },
      created: () => {
        setIsLoaded(true);
      },
    },
    [WheelControls],
  );

  return (
    <div
      ref={sliderRef}
      className={`keen-slider !overflow-visible transition-opacity ${
        isLoaded ? "opacity-100 duration-1000" : "opacity-0"
      }`}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <div key={index} className="keen-slider__slide">
            {child}
          </div>
        ))
      ) : (
        <div className="keen-slider__slide">{children}</div>
      )}
    </div>
  );
}

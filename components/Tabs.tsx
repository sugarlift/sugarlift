import React, { useRef, useEffect, useState, forwardRef } from "react";

interface TabProps {
  title: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  isFocused?: boolean;
}

const Tab = forwardRef<HTMLLIElement, TabProps>(
  ({ title, onClick, isFocused }, ref) => {
    return (
      <li ref={ref} className="relative flex-shrink-0" onClick={onClick}>
        <button
          className={`h-full w-full cursor-pointer text-balance border-none bg-transparent px-6 py-4 text-left text-base tracking-tight transition first:pl-0 last:pr-0 md:py-6 md:text-lg ${
            isFocused ? "text-[#141414]" : "text-zinc-500 hover:text-zinc-950"
          }`}
        >
          {title}
        </button>
      </li>
    );
  },
);

Tab.displayName = "Tab";

interface TabsProps {
  focusedIdx: number;
  children: React.ReactNode;
  onChange: (index: number) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  focusedIdx,
  children,
  onChange,
  className,
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const updateIndicator = () => {
      const currentTab = tabsRef.current[focusedIdx];
      if (currentTab) {
        const { offsetLeft, offsetWidth } = currentTab;
        setIndicatorStyle({
          left: offsetLeft,
          width: offsetWidth,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => window.removeEventListener("resize", updateIndicator);
  }, [focusedIdx]);

  return (
    <div
      className={`relative mb-4 border-b border-[#F1F1F0] md:mb-12 ${className || ""}`}
    >
      <ul className="no-scrollbar relative flex gap-12 overflow-x-auto">
        {React.Children.map(children, (child, i) => {
          const tabChild = child as React.ReactElement<
            TabProps & { ref: React.Ref<HTMLLIElement> }
          >;
          return React.cloneElement(tabChild, {
            key: i,
            isFocused: focusedIdx === i,
            onClick: () => onChange(i),
            ref: (el: HTMLLIElement | null) => {
              tabsRef.current[i] = el;
            },
          });
        })}
      </ul>
      <div
        className="absolute bottom-0 h-[1px] bg-black transition-all duration-300"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
};

interface SlidersProps {
  focusedIdx: number;
  children: React.ReactNode;
  duration?: number;
}

const Sliders: React.FC<SlidersProps> = ({
  focusedIdx,
  children,
  duration = 300,
}) => {
  const offset = -100 * focusedIdx;

  return (
    <div className="overflow-hidden">
      <div
        className="flex w-full flex-nowrap"
        style={{
          transform: `translateX(${offset}%)`,
          transition: `transform ${duration}ms`,
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="w-full flex-shrink-0">{child}</div>
        ))}
      </div>
    </div>
  );
};

export { Tab, Tabs, Sliders };

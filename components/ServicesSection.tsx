"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ServiceCategory =
  | "Budgeting and<br />prioritization"
  | "Access and<br />artwork curation"
  | "Visualization and<br />decision-making"
  | "Procurement and<br />custom commissions"
  | "Activation and<br />content creation";

interface ServiceCard {
  title: string;
  description: string;
  image: string;
}

interface ServiceContent {
  left: ServiceCard;
  right: ServiceCard;
}

const DEFAULT_SERVICES: Record<ServiceCategory, ServiceContent> = {
  "Budgeting and<br />prioritization": {
    left: {
      title: "Budgeting title",
      description:
        "Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor lorem ipsum dolor.",
      image: "/images/services/budgeting-2.jpg",
    },
    right: {
      title: "Prioritization title",
      description:
        "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor. Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit lorem ipsum dolor sit amet.",
      image: "/images/services/budgeting-2.jpg",
    },
  },
  "Access and<br />artwork curation": {
    left: {
      title: "Access title",
      description:
        "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod.",
      image: "/images/services/curation-1.jpg",
    },
    right: {
      title: "Artwork curation title",
      description:
        "Etiam porta sem malesuada magna mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
      image: "/images/services/curation-2.jpg",
    },
  },
  "Visualization and<br />decision-making": {
    left: {
      title: "Visualization title",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.",
      image: "/images/services/visualization-1.jpg",
    },
    right: {
      title: "Decision-making title",
      description:
        "Etiam porta sem malesuada magna mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "/images/services/visualization-2.jpg",
    },
  },
  "Procurement and<br />custom commissions": {
    left: {
      title: "Procurement title",
      description:
        "Etiam porta sem malesuada magna mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "/images/services/procurement-1.jpg",
    },
    right: {
      title: "Custom commissions title",
      description:
        "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor.",
      image: "/images/services/procurement-2.jpg",
    },
  },
  "Activation and<br />content creation": {
    left: {
      title: "Activation title",
      description:
        "Curabitur blandit tempus porttitor. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "/images/services/activation-1.jpg",
    },
    right: {
      title: "Content creation title",
      description:
        "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Etiam porta sem malesuada magna mollis euismod.",
      image: "/images/services/activation-2.jpg",
    },
  },
};

export function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(
    "Budgeting and<br />prioritization",
  );

  const categories = Object.keys(DEFAULT_SERVICES) as ServiceCategory[];
  const activeContent = DEFAULT_SERVICES[activeCategory];

  return (
    <>
      <div className="mb-12 border-b border-[#F1F1F0]">
        <div className="no-scrollbar flex gap-16 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "border-b border-[#F1F1F0] px-6 py-6 text-left text-lg transition first:pl-0 last:pr-0",
                activeCategory === category
                  ? "animate border-black text-[#141414] transition fade-in"
                  : "text-neutral-500 hover:opacity-50",
              )}
              dangerouslySetInnerHTML={{ __html: category }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="relative aspect-video overflow-hidden bg-zinc-100">
            <Image
              src={activeContent.left.image}
              alt={activeContent.left.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4 pl-0">
            <h3>{activeContent.left.title}</h3>
            <p className="text-base text-zinc-600">
              {activeContent.left.description}
            </p>
          </div>
        </div>

        <div>
          <div className="relative aspect-video overflow-hidden bg-zinc-100">
            <Image
              src={activeContent.right.image}
              alt={activeContent.right.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4 pl-0">
            <h3>{activeContent.right.title}</h3>
            <p className="text-base text-zinc-600">
              {activeContent.right.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

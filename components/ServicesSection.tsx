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
      title: "Smart Budgeting Strategies",
      description:
        "Optimize your art investment with tailored budgeting solutions that align with your goals. We help you allocate resources effectively to maximize impact, ensuring a thoughtful balance between cost and value.",
      image: "/images/services/budgeting-2.jpg",
    },
    right: {
      title: "Focused Prioritization",
      description:
        "Identify and focus on high-impact opportunities with our prioritization framework. We guide you in selecting the right artworks for your space, elevating your project while staying within budget.",
      image: "/images/services/budgeting-2.jpg",
    },
  },
  "Access and<br />artwork curation": {
    left: {
      title: "Unparalleled Art Access",
      description:
        "Gain access to a vast network of artists, galleries, and unique pieces. Our connections ensure that you can discover exclusive works tailored to your project's vision.",
      image: "/images/services/curation-1.jpg",
    },
    right: {
      title: "Expert Artwork Curation",
      description:
        "Our curation services bring cohesion to your spaces by selecting pieces that align with your brand, aesthetic, and audience preferences, creating an unforgettable visual experience.",
      image: "/images/services/curation-2.jpg",
    },
  },
  "Visualization and<br />decision-making": {
    left: {
      title: "Immersive Visualization Tools",
      description:
        "Preview how artworks will look in your space with advanced visualization techniques. We help bring your vision to life, ensuring confidence in your decisions.",
      image: "/images/services/visualization-1.jpg",
    },
    right: {
      title: "Informed Decision-Making",
      description:
        "Navigate your art selection journey with clarity and precision. Our expertise ensures that each decision aligns with your goals and enhances your space's identity.",
      image: "/images/services/visualization-2.jpg",
    },
  },
  "Procurement and<br />custom commissions": {
    left: {
      title: "Seamless Art Procurement",
      description:
        "Streamline the process of acquiring exceptional artworks with our procurement services. From sourcing to delivery, we handle all the details to ensure a smooth experience.",
      image: "/images/services/procurement-1.jpg",
    },
    right: {
      title: "Bespoke Custom Commissions",
      description:
        "Collaborate with artists to create custom pieces designed exclusively for your project. Tailor-made artworks transform your space into a unique and inspiring environment.",
      image: "/images/services/procurement-2.jpg",
    },
  },
  "Activation and<br />content creation": {
    left: {
      title: "Dynamic Space Activation",
      description:
        "Transform your space into a cultural destination with thoughtfully curated activations. Our art programs foster engagement and enrich visitor experiences.",
      image: "/images/services/activation-1.jpg",
    },
    right: {
      title: "Engaging Content Creation",
      description:
        "Enhance your project’s story with custom content that highlights the art and its impact. From visuals to storytelling, we craft compelling narratives that captivate audiences.",
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

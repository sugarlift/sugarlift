"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

interface FAQProps {
  className?: string;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  return (
    <div className="border-b border-neutral-200">
      <button
        className="flex w-full items-center py-4 text-left"
        onMouseDown={onClick}
      >
        <span className="mr-4">{isOpen ? "−" : "+"}</span>
        <span className="text-lg font-medium">{question}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 pl-12 text-neutral-600">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DesignerFAQ = [
  {
    question: "Augue laoreet rutrum faucibus dolor auctor?",
    answer:
      "Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor.",
  },
  {
    question: "Etiam porta sem malesuada magna molli?",
    answer: "Lorem ipsum dolor sit amet...",
  },
  {
    question: "Lorem ipsum dolor sit amet?",
    answer: "Lorem ipsum dolor sit amet...",
  },
];

const DeveloperFAQ = [
  {
    question: "Curabitur blandit tempus porttitor?",
    answer: "Lorem ipsum dolor sit amet...",
  },
  {
    question: "Vivamus sagittis lacus vel?",
    answer: "Lorem ipsum dolor sit amet...",
  },
  {
    question: "Faucibus dolor auctor lorem ipsum dolor?",
    answer: "Lorem ipsum dolor sit amet...",
  },
];

const DEFAULT_FAQ_ITEMS = {
  "Interior design firms": DesignerFAQ,
  "Real estate developers": DeveloperFAQ,
};

type CategoryKey = keyof typeof DEFAULT_FAQ_ITEMS;

export function FAQ({ className = "" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(
    "Interior design firms",
  );

  const categories = Object.keys(DEFAULT_FAQ_ITEMS);
  const filteredItems = DEFAULT_FAQ_ITEMS[activeCategory];

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className={`container my-32 grid grid-cols-1 gap-8 md:grid-cols-2 ${className}`}
    >
      <div>
        <h2 className="mb-8 text-3xl">Frequently asked questions</h2>
        <p className="max-w-xl">
          Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna
          mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
          auctor.{" "}
        </p>
      </div>
      <div>
        <div className="mb-8 flex gap-8 border-b border-[#F1F1F0]">
          {categories.map((category) => (
            <button
              key={category}
              onMouseDown={() => setActiveCategory(category as CategoryKey)}
              className={`px-6 py-8 text-lg ${
                activeCategory === category
                  ? "animate text-[#141414] shadow-[inset_0_-1px_white,_0_1px_black] transition fade-in"
                  : "text-neutral-500 transition hover:opacity-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="max-w-3xl">
          {filteredItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

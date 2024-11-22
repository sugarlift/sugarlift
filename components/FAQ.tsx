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

// Developer FAQ sections
const ExperienceAndExpertiseFAQ = [
  {
    question: "What is your experience with projects similar to ours?",
    answer:
      "We have over ten years of experience working on a variety of projects, including multifamily residential properties, hospitality projects, and commercial developments. Our portfolio includes successful collaborations where we've integrated art programs, always tailoring our approach to meet the specific needs and objectives of each development.",
  },
  {
    question: "Can you provide case studies or references?",
    answer:
      "Yes, we can provide case studies, images, and testimonials from previous projects to demonstrate our expertise and the impact of our art programs. We respect our clients' confidentiality, so while we may not mention specific names publicly, we can arrange visits to properties we've worked on and connect you with previous clients upon request.",
  },
];

const ArtSelectionFAQ = [
  {
    question:
      "How will you select art that aligns with our brand and target market?",
    answer:
      "We begin by conducting a thorough analysis of your brand identity, project objectives, and target demographic. By understanding your audience's preferences and expectations, we select artworks that resonate with them and reinforce your brand. We collaborate closely with you and all stakeholders to ensure that the art enhances the space and aligns with your vision.",
  },
  {
    question:
      "Are you able to work with specific themes or styles we have in mind?",
    answer:
      "Absolutely. We operate with an open architecture approach and have access to a vast community of artists across various styles and mediums. Whether you have specific themes, styles, or narratives in mind, we can source artists and artworks that fit your vision. We are flexible and adept at tailoring our selections to meet your specific requirements.",
  },
];

// Developer FAQ sections (continued)
const BudgetManagementFAQ = [
  {
    question: "Can you work within our budget constraints?",
    answer:
      "Yes, we work within your budget to maximize impact. If you do not have an established budget, we can help you determine an appropriate budget using our data-driven proprietary tools. We provide detailed budget estimates based on your space and priorities, balancing investment in high-impact areas with cost-effective solutions in secondary spaces.",
  },
  {
    question: "How do you structure your fees and what is included?",
    answer:
      "We do not charge upfront consulting or design fees. Our compensation comes from a commission paid by the artists upon the sale of their work. This means you pay the market price for the artwork without additional consulting fees. Our services include everything from initial consultation and art selection to procurement, logistics, and installation.",
  },
];

const ProjectTimelineFAQ = [
  {
    question: "What is your projected timeline for this project?",
    answer:
      "Timelines vary based on the project's scope and complexity. Generally, a full building project can be completed in 2-6 months. We can adapt to your schedule and are flexible to accommodate your project's needs. Whether involved early or later in the project, we ensure timely delivery without compromising on quality.",
  },
  {
    question: "How do you handle tight deadlines or schedule changes?",
    answer:
      "We are experienced in managing tight deadlines and can accommodate last-minute projects when necessary. Our extensive network of artists and resources allows us to provide efficient solutions without compromising on quality. We maintain open communication throughout the project to adjust to any schedule changes and ensure timely delivery.",
  },
];

const InstallationLogisticsFAQ = [
  {
    question: "Do you handle the installation process?",
    answer:
      "Yes, we handle all aspects of installation and logistics. This includes transportation, framing, coordination with your project's schedule, and professional installation. Our team ensures that artwork is installed safely and efficiently, minimizing disruption and aligning seamlessly with your overall timeline.",
  },
  {
    question: "How do you address potential installation challenges?",
    answer:
      "We anticipate potential challenges by conducting thorough site assessments and planning. We collaborate with your architects, interior designers, and construction teams to understand the space fully. Our experienced installers are equipped to handle complex installations, and we develop customized solutions to address any issues that may arise.",
  },
];

const ArtistNetworksFAQ = [
  {
    question:
      "Do you have established relationships with artists or galleries?",
    answer:
      "Yes, we have an extensive network that includes hundreds of artists showcased in our gallery and access to a vast community through our proprietary artist and gallery network. Our relationships span emerging and established artists across various mediums and styles, allowing us to source unique and fitting pieces for your project.",
  },
  {
    question: "Can you source local or emerging artists?",
    answer:
      "Absolutely. We are committed to supporting local and emerging artists. If you wish to engage with artists from a specific community or region, we can source talent that not only aligns with your project's aesthetic but also enhances community engagement and supports local talent.",
  },
];

const LegalComplianceFAQ = [
  {
    question:
      "Can you help us work with government organizations such as the Public Design Commission (PDC) and other government agencies for approvals?",
    answer:
      "Yes, we are experienced in working with government organizations and regulatory bodies like the Public Design Commission (PDC) and others. We can assist you in navigating the approval process by preparing necessary documentation, presentations, and submissions required by these agencies. Our team understands the protocols, standards, and timelines these organizations expect and can help ensure that your art installations meet all regulatory requirements and receive timely approvals.",
  },
  {
    question: "Do you manage permits or insurance related to the artwork?",
    answer:
      "Yes, we handle necessary permits and insurance for the artwork during transportation and installation. Once installed, we assist you in ensuring the artwork is included in your property's insurance coverage. Our goal is to mitigate risk and manage all legal and logistical aspects related to the art.",
  },
];

const ValueAddFAQ = [
  {
    question: "How will the art enhance the property's value and appeal?",
    answer:
      "Art enhances the aesthetic appeal of your property, creates memorable experiences for residents or tenants, and differentiates your project in a competitive market. Thoughtfully curated art can contribute to higher occupancy rates, increased property value, and stronger community engagement. It reinforces your brand identity and can be a powerful marketing tool.",
  },
  {
    question:
      "Can you provide metrics or examples of increased engagement due to art installations?",
    answer:
      "While specific metrics can vary, we can provide case studies where our art programs have positively impacted leasing rates, sales velocity, and overall tenant satisfaction. For example, properties we've worked on have reported faster lease-ups and increased media attention due to distinctive art installations.",
  },
];

const MaintenanceAftercareFAQ = [
  {
    question: "What maintenance does the art require?",
    answer:
      "Maintenance requirements vary depending on the type of artwork and materials used. We provide you with detailed maintenance guidelines for each piece, including recommendations for cleaning, environmental conditions, and handling precautions to ensure the artwork remains in optimal condition over time.",
  },
  {
    question: "Do you offer maintenance services or guidelines?",
    answer:
      "Yes, we offer maintenance guidelines as part of our service. While we do not provide ongoing maintenance services directly, we can recommend trusted conservators or maintenance professionals if needed. Our goal is to support you in preserving the artwork's integrity and appearance.",
  },
];

const StakeholderCollaborationFAQ = [
  {
    question:
      "How will you coordinate with our architects and interior designers?",
    answer:
      "We believe in collaboration and view ourselves as an extension of your team. We work closely with your architects, interior designers, and other stakeholders to ensure the art integrates with the overall design. Regular communication and coordination are key aspects of our process.",
  },
  {
    question: "What is your communication process throughout the project?",
    answer:
      "We maintain open and transparent communication throughout the project. This includes regular updates, meetings at key milestones, and prompt responses to any inquiries. We adapt to your preferred communication channels and ensure all stakeholders are informed and aligned at each stage of the project.",
  },
];

// Modify FAQSectionProps to include expanded state
interface FAQSectionProps {
  title: string;
  items: Array<{ question: string; answer: string }>;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQSection = ({
  title,
  items,
  isExpanded,
  onToggle,
}: FAQSectionProps) => {
  return (
    <div className="border-b border-neutral-200">
      <button
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={onToggle}
      >
        <h3>{title}</h3>
        <span className="ml-4 text-lg">{isExpanded ? "−" : "+"}</span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-8 pb-12 pl-8">
              {items.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">{item.question}</h4>
                  <p className="text-base text-zinc-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modified FAQ sections structure
const DeveloperFAQSections = [
  { title: "1. Experience and Expertise", items: ExperienceAndExpertiseFAQ },
  { title: "2. Art Selection and Alignment", items: ArtSelectionFAQ },
  { title: "3. Budget Management", items: BudgetManagementFAQ },
  { title: "4. Project Timeline", items: ProjectTimelineFAQ },
  { title: "5. Installation and Logistics", items: InstallationLogisticsFAQ },
  { title: "6. Artist Networks", items: ArtistNetworksFAQ },
  { title: "7. Legal and Compliance", items: LegalComplianceFAQ },
  { title: "8. Value Add", items: ValueAddFAQ },
  { title: "9. Maintenance and Aftercare", items: MaintenanceAftercareFAQ },
  {
    title: "10. Collaboration with Stakeholders",
    items: StakeholderCollaborationFAQ,
  },
];

// Designer FAQ sections
const IntegrationDesignFAQ = [
  {
    question:
      "How do you approach integrating art with our interior design themes?",
    answer:
      "We begin by thoroughly understanding your interior design concepts, themes, and aesthetics. By reviewing your design plans, mood boards, material selections, and style preferences, we ensure that the artwork complements and enhances your design vision. We collaborate closely with your design team to select artworks that align seamlessly with your concepts, creating a cohesive aesthetic and narrative throughout the space.",
  },
  {
    question:
      "Can you adapt to different design styles and client preferences?",
    answer:
      "Absolutely. We are highly adaptable and experienced in working with a wide range of design styles—from traditional and classic to modern, minimalist, and avant-garde. We tailor our art selections to match both the design style and the client's preferences, ensuring that the artwork resonates with the intended audience and supports the overall design goals.",
  },
];

const CollaborationCommunicationFAQ = [
  {
    question: "What is your process for collaborating with design teams?",
    answer:
      "We view ourselves as an extension of your design team. Our collaborative process involves regular communication and coordination to ensure alignment at every stage. We participate in design meetings, provide timely updates, and are responsive to your needs. We integrate our timelines with yours and work closely with architects, interior designers, and other stakeholders to ensure seamless integration of art into the project.",
  },
  {
    question: "How do you handle feedback and revisions?",
    answer:
      "Dialogue and feedback are an essential part of the collaborative process. We provide visualizations, renderings, mock-ups, and samples to facilitate discussions and are responsive to any requested changes. Our goal is to refine the art selections until they perfectly align with your vision and meet the project's objectives.",
  },
];

const SourcingCustomizationFAQ = [
  {
    question: "Can you source or commission custom pieces?",
    answer:
      "Yes, we frequently commission custom artworks tailored to your project's specific needs. We collaborate with artists to create site-specific pieces, including murals, sculptures, bespoke paintings, and installations using various materials and techniques.",
  },
  {
    question: "Do you have access to a diverse range of artists and mediums?",
    answer:
      "Absolutely. We have an extensive network of artists across a wide array of styles, mediums, and cultural backgrounds. This includes emerging and established artists working in painting, sculpture, textiles, mixed media, digital art, photography, installations, and more. Our diverse network allows us to find the perfect match for any project requirement, ensuring variety and uniqueness in our art selections.",
  },
];

const BudgetTimelineFAQ = [
  {
    question: "How do your services fit within our project budgets?",
    answer:
      "We work within your budget to maximize impact. If you do not have an established art budget, we can help you determine an appropriate one using our data-driven proprietary tools to achieve the desired effect for your investment. We provide detailed budget estimates based on your space and priorities, balancing investment in high-impact areas with cost-effective solutions elsewhere.",
  },
  {
    question: "Are you able to provide cost-effective alternatives if needed?",
    answer:
      "Yes, we offer flexible options to suit different budget levels. We can suggest a mix of original artworks, limited edition prints, and immersive installations to achieve the desired aesthetic while managing costs. We strive to find creative solutions that provide value without compromising on quality or design integrity.",
  },
];

const TimelineCoordinationFAQ = [
  {
    question: "Can you align your schedule with our project timelines?",
    answer:
      "Yes, we are committed to aligning our schedule with your project timelines. We understand the importance of timely delivery and integrate our milestones with yours to ensure seamless delivery. Whether involved from the project's inception or brought in at a later stage, we coordinate closely to meet all deadlines and adapt to the project's specific needs.",
  },
  {
    question: "How do you manage unforeseen delays or changes in the schedule?",
    answer:
      "We are experienced in adapting to schedule changes and unforeseen delays. Our flexible approach allows us to adjust plans as needed, whether it's expediting certain processes or rescheduling installations. We maintain open communication to address any changes promptly and mitigate potential impacts on the project, ensuring that timelines are met without compromising on quality.",
  },
];

const InstallationExpertiseFAQ = [
  {
    question: "Do you oversee the installation of the artworks?",
    answer:
      "Yes, we manage the entire installation process. Our professional installation team is skilled in handling artworks of all types and sizes, ensuring they are installed safely and presented optimally. We coordinate with your team to schedule installations at convenient times, integrate with construction schedules, and ensure minimal disruption to other project activities.",
  },
  {
    question: "How do you handle site-specific challenges during installation?",
    answer:
      "We conduct thorough site assessments to anticipate and plan for any installation challenges. Our team is adept at problem-solving and can address issues such as structural limitations, varying wall materials, security requirements, and environmental factors. We develop customized solutions to ensure successful installations in any setting, always prioritizing safety and aesthetics.",
  },
];

const TechnicalKnowledgeFAQ = [
  {
    question:
      "How do you consider lighting, space, and materials in your art selection?",
    answer:
      "We carefully evaluate the physical environment, including lighting conditions (both natural and artificial), spatial dimensions, traffic flow, and material finishes, to select artworks that enhance and harmonize with the space. We consider factors like color palettes, textures, scale, and sightlines to ensure the art integrates seamlessly and elevates the overall design. We can also collaborate on lighting design to showcase the artwork effectively.",
  },
  {
    question:
      "Can you provide guidance on preservation and durability in different environments?",
    answer:
      "Yes, we advise on material choices and framing options that suit the environmental conditions of the space, such as humidity, temperature fluctuations, exposure to sunlight, and public interaction. We select artworks and materials that are appropriate for the setting—whether it's a high-traffic lobby, outdoor area, or intimate interior space—to ensure longevity and minimal maintenance.",
  },
];

const ClientEngagementFAQ = [
  {
    question: "How involved will the client be in the art selection process?",
    answer:
      "The level of client involvement can be tailored to your preferences and the client's desires. We can work closely with you as the design team or include the client in presentations and decision-making as desired. Our goal is to facilitate a process that meets everyone's needs, ensures client satisfaction, and maintains efficiency and cohesion in the project.",
  },
  {
    question: "Can you assist in presenting art options to our clients?",
    answer:
      "Yes, we can support you in client presentations by providing visual materials, detailed explanations, and attending meetings if appropriate. We articulate the concepts, narratives, and benefits behind the art selections to enhance the client's understanding and appreciation, aiding in securing approvals and enthusiasm for the project.",
  },
];

const LegalEthicalFAQ = [
  {
    question: "How do you handle licensing and reproduction rights?",
    answer:
      "We manage all licensing and reproduction rights, ensuring that all artworks are acquired legally and ethically. We negotiate agreements with artists and rights holders to secure the necessary permissions for use, including any reproductions, prints, or digital displays. This protects you and your clients from any legal complications related to intellectual property.",
  },
  {
    question: "Do you ensure ethical sourcing of all artworks?",
    answer:
      "Yes, we are committed to ethical practices in all aspects of our work. We ensure that all artworks are sourced responsibly, with fair compensation to artists. We prioritize integrity and uphold high ethical standards in our relationships with artists, clients, and partners.",
  },
];

const PostInstallationFAQ = [
  {
    question: "How do you offer maintenance guidelines for the artwork?",
    answer:
      "We provide maintenance guidelines and care instructions for all installed artworks. While we do not offer ongoing maintenance services directly, we can recommend trusted conservators or maintenance professionals if needed. Our support includes advice on cleaning, environmental conditions, and handling precautions to preserve the artwork's integrity and appearance over time.",
  },
  {
    question: "Can you assist with future art rotations or updates?",
    answer:
      "Absolutely. We can assist with rotating artworks, updating installations, or expanding the collection as your needs evolve. Whether it's new design phases or refreshing the space, we are here to support you and your clients with any future art-related needs. We value long-term relationships and aim to be a continued resource for your projects.",
  },
];

// Update the DesignerFAQSections array with the correct order
const DesignerFAQSections = [
  { title: "1. Integration with Design Concepts", items: IntegrationDesignFAQ },
  {
    title: "2. Collaboration and Communication",
    items: CollaborationCommunicationFAQ,
  },
  { title: "3. Sourcing and Customization", items: SourcingCustomizationFAQ },
  { title: "4. Budget Management", items: BudgetTimelineFAQ },
  { title: "5. Timeline Coordination", items: TimelineCoordinationFAQ },
  { title: "6. Installation Expertise", items: InstallationExpertiseFAQ },
  { title: "7. Technical Knowledge", items: TechnicalKnowledgeFAQ },
  { title: "8. Client Engagement", items: ClientEngagementFAQ },
  { title: "9. Legal and Ethical Considerations", items: LegalEthicalFAQ },
  { title: "10. Post-Installation Support", items: PostInstallationFAQ },
];

const DEFAULT_FAQ_ITEMS = {
  "Interior design firms": DesignerFAQSections,
  "Real estate developers": DeveloperFAQSections,
};

type CategoryKey = keyof typeof DEFAULT_FAQ_ITEMS;

export function FAQ({ className = "" }: FAQProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(
    "Interior design firms",
  );
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const categories = Object.keys(DEFAULT_FAQ_ITEMS);
  const sections = DEFAULT_FAQ_ITEMS[activeCategory];

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <section
      className={`container grid grid-cols-1 gap-8 md:grid-cols-2 ${className}`}
    >
      <div>
        <h2 className="mb-10 text-3xl">Frequently asked questions</h2>
        <p className="max-w-xl">
          Curabitur blandit tempus porttitor. Etiam porta sem malesuada magna
          mollis euismod. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
          auctor.
        </p>
      </div>
      <div>
        <div className="mb-2 flex gap-12 border-b border-[#F1F1F0]">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category as CategoryKey);
                setExpandedSection(0);
              }}
              className={`px-0 pb-4 pt-[9px] text-lg ${
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
          {sections.map((section, index) => (
            <FAQSection
              key={section.title}
              title={section.title}
              items={section.items}
              isExpanded={expandedSection === index}
              onToggle={() => toggleSection(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

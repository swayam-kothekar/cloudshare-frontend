import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is CloudShare?",
    answer: "CloudShare is a secure, cloud-based file-sharing platform where users can upload files and generate temporary links for sharing. The platform offers flexible file-sharing options, including expiry-based link generation and customizable download permissions.",
    value: "item-1",
  },
  {
    question: "How do I upload and share files?",
    answer:"To share a file, simply upload it using our easy-to-use interface. Once the file is uploaded, you'll receive a temporary link that you can share with others. You can set the file to expire after a specific time or limit the number of downloads.",
    value: "item-2",
  },
  {
    question:
     "How long do shared files remain accessible?",
    answer:"By default, files are available for 24 hours after upload. You can customize the expiry duration during the upload process if you need a shorter or longer time window.",
    value: "item-3",
  },
  {
    question: "Can I set a download limit for my files?",
    answer: "Yes, you can configure whether your file can be downloaded once, multiple times, or without any restrictions. This option is available during the file upload process.",
    value: "item-4",
  },
  {
    question:
      " Is there a file size limit?",
    answer: "Yes, currently, the maximum file size allowed is 50MB. If you need to share larger files, please contact our support team for assistance.",
    value: "item-5",
  },
  {
    question:
      "How secure is CloudShare?",
    answer: "We take security seriously. All files are encrypted both during upload and download to ensure your data is protected. Additionally, we generate secure, randomized links for each file, so only those with access to the link can download the file.",
    value: "item-6",
  },
  {
    question:
      " Is there a file size limit?",
    answer: "Yes, currently, the maximum file size allowed is 50MB. If you need to share larger files, please contact our support team for assistance.",
    value: "item-7",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};

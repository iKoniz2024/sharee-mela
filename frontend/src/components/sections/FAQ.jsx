"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "How do I place an order?",
    answer:
      "Browse products, add your favorite items to the cart, proceed to checkout, enter your shipping details, and complete the payment to place your order.",
  },
  {
    id: "faq-2",
    question: "How long does shipping take?",
    answer:
      "Orders are typically delivered within 3–7 business days depending on your location and product availability.",
  },
  {
    id: "faq-3",
    question: "What is your return policy?",
    answer:
      "You can request a return within the eligible return period if the product meets our return policy requirements.",
  },
  {
    id: "faq-4",
    question: "Which payment methods do you accept?",
    answer:
      "We currently offer Cash on Delivery (COD) as our payment method. Pay when your order arrives at your doorstep.",
  },
  {
    id: "faq-5",
    question: "Can I track my order?",
    answer:
      "Yes. After your order is confirmed, you'll receive tracking information so you can monitor your shipment.",
  }
];

export default function FAQ({ children }) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Everything you need to know before placing your order.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Accordion defaultValue="faq-1">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="px-5 py-4 text-base font-medium hover:no-underline sm:px-6">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 sm:px-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

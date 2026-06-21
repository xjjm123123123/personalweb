import { motion, useReducedMotion } from "motion/react";
import { content } from "../data/content";

export function Beyond() {
  const { beyond } = content;
  const reduce = useReducedMotion();

  return (
    <section id="beyond" className="py-24 w-full border-t border-white/5 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl font-bold tracking-tight text-white mb-16"
        >
          简历之外
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beyond.map((item, i) => (
            <motion.div
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col rounded-3xl overflow-hidden bg-brand-card border border-white/5"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 mix-blend-luminosity"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

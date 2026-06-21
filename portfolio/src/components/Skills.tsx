import { motion, useReducedMotion } from "motion/react";
import { content } from "../data/content";

export function Skills() {
  const { skills } = content;
  const reduce = useReducedMotion();

  return (
    <section id="skills" className="py-24 w-full">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl font-bold tracking-tight text-white mb-16"
        >
          技能工具
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillGroup, i) => (
            <motion.div
              key={skillGroup.category}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl bg-brand-card border border-white/5 p-8"
            >
              <h3 className="text-lg font-bold text-white mb-6">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map(item => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-sm font-medium text-brand-text border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, EnvelopeSimple, GithubLogo, LinkedinLogo, FilePdf } from "@phosphor-icons/react";
import { content } from "../data/content";

export function Contact() {
  const { contact } = content;
  const reduce = useReducedMotion();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="py-24 w-full border-t border-white/5 bg-brand-bg relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-12 max-w-2xl"
        >
          {contact.heading}
        </motion.h2>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-4 mb-24"
        >
          <a
            href={`mailto:${contact.email}`}
            className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-bg transition-transform hover:scale-[0.98] active:scale-95"
          >
            <EnvelopeSimple weight="bold" className="text-lg" />
            发邮件给我
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            <LinkedinLogo weight="bold" className="text-lg" />
            LinkedIn
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            <GithubLogo weight="bold" className="text-lg" />
            GitHub
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            <FilePdf weight="bold" className="text-lg" />
            简历下载
          </a>
        </motion.div>

        <div className="w-full border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-muted">
          <p>© {new Date().getFullYear()} 个人品牌展示. All rights reserved.</p>
          
          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            返回顶部
            <ArrowUp weight="bold" />
          </button>
        </div>
      </div>
    </footer>
  );
}

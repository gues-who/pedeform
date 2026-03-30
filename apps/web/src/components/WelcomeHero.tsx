"use client";

import { motion } from "framer-motion";
import { APP_NAME } from "@pedeform/shared";

export function WelcomeHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left"
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        Concierge digital
      </p>
      <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {APP_NAME}
      </h1>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Experiência fluida para alta gastronomia — cardápio, salão e cozinha em
        sincronia.
      </p>
    </motion.div>
  );
}

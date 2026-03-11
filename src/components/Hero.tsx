{/* CTA Buttons */}
<motion.div
  variants={itemVariants}
  className="flex flex-wrap items-center justify-center gap-4 mt-16"
>
  <motion.a
    href="/ocr"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-3 glass-strong rounded-full font-mono text-sm text-purple-300 hover:text-white transition-colors border border-purple-500/30 hover:border-purple-500/60 glow-purple"
  >
    OCR Tool
  </motion.a>
  
  <motion.a
    href="/chess"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-3 glass-strong rounded-full font-mono text-sm text-purple-300 hover:text-white transition-colors border border-purple-500/30 hover:border-purple-500/60 glow-purple"
  >
    Chess
  </motion.a>
  
  <motion.a
    href="#contact"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="relative px-10 py-4 rounded-full font-mono text-sm text-white btn-gradient overflow-hidden group"
  >
    <span className="relative z-10">Get in Touch</span>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ opacity: 0.3 }}
    />
  </motion.a>
</motion.div>

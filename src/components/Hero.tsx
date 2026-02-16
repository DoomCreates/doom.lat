{/* Enhanced CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-6 mt-16"
        >
          <motion.a
            href="#work"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)',
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-3 glass rounded-full font-mono text-sm text-white/80 hover:text-white transition-all overflow-hidden"
          >
            <span className="relative z-10">View Work</span>
            <motion.div
              className="absolute inset-0 bg-white/03"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
          
          <motion.a
            href="#contact"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-3 rounded-full font-mono text-sm text-black bg-white hover:bg-white/90 transition-all overflow-hidden"
          >
            <span className="relative z-10">Get in Touch</span>
          </motion.a>
        </motion.div>

{/* Optimized showcase section */}
      <section id="showcase" className="min-h-screen flex items-center justify-center px-6 relative z-10 py-20">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left side - Video with simplified frame */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Simplified decorative frame */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />
              
              {/* Static corner glows - no animation */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white/40 rounded-full blur-md" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white/40 rounded-full blur-md" />

              {/* Video container */}
              <div className="relative glass-strong rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="aspect-video bg-black/20 flex items-center justify-center">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/videos/blade-ball-showcase.mp4" type="video/mp4" />
                    <div className="flex flex-col items-center justify-center h-full text-white/50">
                      <svg
                        className="w-20 h-20 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="font-mono text-sm">Video Preview</p>
                    </div>
                  </video>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 glass rounded-full font-mono text-xs tracking-[0.2em] text-white/40 uppercase">
                  Featured Project
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="font-display text-4xl md:text-6xl text-white font-light tracking-tight leading-tight"
              >
                External Blade Ball AP Showcase
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <p className="font-mono text-base text-white/60 leading-relaxed">
                  An advanced automation platform designed for Blade Ball, featuring intelligent auto-parry mechanics, 
                  precision timing algorithms, and seamless integration with game mechanics.
                </p>
                <p className="font-mono text-base text-white/60 leading-relaxed">
                  Built with cutting-edge technology to deliver unparalleled performance and reliability, 
                  pushing the boundaries of what's possible in game automation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {[
                  'Intelligent Auto-Parry System',
                  'Real-time Performance Optimization',
                  'Advanced Detection Evasion',
                  'Seamless User Experience',
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors" />
                    <span className="font-mono text-sm text-white/50 group-hover:text-white/80 transition-colors">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-3 glass-strong rounded-full font-mono text-sm text-white/80 hover:text-white transition-colors"
                >
                  Learn More
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

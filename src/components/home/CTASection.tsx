import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background Elements - Enhanced Visibility */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-30">
          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-card/30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
              Ready to Streamline Your Logistics?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Let's discuss how we can optimize your supply chain and deliver 
              your goods faster, safer, and more cost-effectively.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 orange-glow"
              >
                Request a Quote
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-foreground rounded-xl font-semibold transition-all hover:bg-secondary/80 border border-border"
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

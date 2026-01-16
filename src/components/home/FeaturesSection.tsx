import { motion } from "framer-motion";
import { Globe, Shield, Clock, Headphones, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Extensive network spanning 150+ countries with strategic partnerships worldwide.",
  },
  {
    icon: Shield,
    title: "Secure Handling",
    description: "Advanced security protocols and insurance options to protect your cargo.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "99.5% on-time delivery rate with real-time tracking and notifications.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team available around the clock to assist you.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics and reporting for complete supply chain visibility.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Streamlined customs clearance and documentation for faster turnaround.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Built for Modern Logistics
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We combine cutting-edge technology with decades of experience to deliver 
            logistics solutions that exceed expectations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

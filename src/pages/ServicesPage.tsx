import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { motion } from "framer-motion";
import { Plane, Ship, Truck, Warehouse, Package, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Plane,
    title: "Air Freight",
    description: "Fast and reliable air cargo services to any destination worldwide. We partner with major airlines to ensure your shipments arrive on time, every time.",
    features: ["Express delivery options", "Temperature-controlled cargo", "Dangerous goods handling", "Real-time tracking"],
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Ship,
    title: "Ocean Freight",
    description: "Cost-effective sea freight solutions for large shipments. We offer both FCL (Full Container Load) and LCL (Less than Container Load) options.",
    features: ["Full container loads", "Consolidation services", "Port-to-port & door-to-door", "Customs brokerage"],
    image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Truck,
    title: "Ground Transport",
    description: "Comprehensive road freight services with door-to-door delivery. Our extensive network covers major routes across continents.",
    features: ["FTL & LTL options", "Cross-border logistics", "Expedited shipping", "GPS tracking"],
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Warehouse,
    title: "Warehousing & Distribution",
    description: "State-of-the-art storage facilities with comprehensive inventory management and fulfillment services.",
    features: ["Climate-controlled storage", "Inventory management", "Pick and pack services", "Distribution networks"],
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Package,
    title: "Customs Brokerage",
    description: "Expert customs clearance services to ensure smooth and compliant international trade operations.",
    features: ["Documentation handling", "Duty optimization", "Regulatory compliance", "Trade consulting"],
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Globe,
    title: "Supply Chain Solutions",
    description: "End-to-end supply chain management designed to optimize your operations and reduce costs.",
    features: ["Supply chain design", "Vendor management", "Analytics & reporting", "Risk management"],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 bg-card overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2070&q=80"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                What We Offer
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Our Services
              </h1>
              <p className="text-muted-foreground text-lg lg:text-xl">
                Comprehensive logistics solutions tailored to meet your unique business 
                requirements. From air freight to warehousing, we've got you covered.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services List */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <div className="space-y-24">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                      <p className="text-muted-foreground text-lg mb-8">
                        {service.description}
                      </p>
                      <ul className="space-y-3 mb-8">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                      >
                        Get a Quote
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Image */}
                    <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Contact us today to discuss your logistics needs and get a customized quote.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:bg-primary/90 orange-glow"
              >
                Request a Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        <LogisticsFooter />
      </main>
    </div>
  );
}

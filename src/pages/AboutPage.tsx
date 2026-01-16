import { Sidebar } from "@/components/layout/Sidebar";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { motion } from "framer-motion";
import { Target, Eye, Award, Users, Globe, TrendingUp } from "lucide-react";

const stats = [
  { value: "25+", label: "Years of Experience" },
  { value: "150+", label: "Countries Served" },
  { value: "10K+", label: "Happy Clients" },
  { value: "50M+", label: "Packages Delivered" },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for excellence in every shipment, every interaction, and every solution we provide.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Our customers are at the heart of everything we do. Their success is our success.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "With partners worldwide, we deliver seamless logistics solutions across every continent.",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description: "We continuously innovate to provide smarter, faster, and more efficient logistics solutions.",
  },
];

const team = [
  {
    name: "Sarah Johnson",
    role: "Chief Executive Officer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Michael Chen",
    role: "Chief Operations Officer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Emily Rodriguez",
    role: "VP of Global Logistics",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "David Park",
    role: "VP of Technology",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 bg-card overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=2070&q=80"
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
                About Us
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Moving the World Forward
              </h1>
              <p className="text-muted-foreground text-lg lg:text-xl">
                For over 25 years, SwiftLogix has been a trusted partner in global 
                logistics, helping businesses of all sizes move their goods efficiently 
                across the world.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-primary-foreground/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide seamless, reliable, and innovative logistics solutions that 
                  empower businesses to grow globally. We are committed to delivering 
                  excellence through technology, sustainability, and customer-centric services.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the world's most trusted logistics partner, recognized for our 
                  innovation, sustainability, and unwavering commitment to customer success. 
                  We envision a connected world where distance is no barrier to business.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Our Values
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">
                What Drives Us
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
                Meet Our Team
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our experienced leadership team brings decades of logistics expertise 
                to deliver exceptional results for our clients.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-24 bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 lg:pl-[120px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Industry Recognition
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Our commitment to excellence has been recognized by industry leaders 
                and organizations worldwide.
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
                <span className="px-6 py-3 bg-secondary rounded-xl">Best Logistics Provider 2025</span>
                <span className="px-6 py-3 bg-secondary rounded-xl">ISO 9001 Certified</span>
                <span className="px-6 py-3 bg-secondary rounded-xl">Green Supply Chain Award</span>
                <span className="px-6 py-3 bg-secondary rounded-xl">Top 100 3PL Companies</span>
              </div>
            </motion.div>
          </div>
        </section>

        <LogisticsFooter />
      </main>
    </div>
  );
}

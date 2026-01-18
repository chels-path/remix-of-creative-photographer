import { Sidebar } from "@/components/layout/Sidebar";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { LogisticsFooter } from "@/components/layout/LogisticsFooter";
import { CustomerChatWidget } from "@/components/chat/CustomerChatWidget";

export default function LogisticsHome() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-20">
        <HeroSection />
        <ServicesPreview />
        <FeaturesSection />
        <CTASection />
        <LogisticsFooter />
      </main>
      <CustomerChatWidget />
    </div>
  );
}

import { SiteHeader } from '@/components/marketing/site-header';
import { HeroSection } from '@/components/marketing/hero-section';
import { MissionSection } from '@/components/marketing/mission-section';
import { OfferingsSection } from '@/components/marketing/offerings-section';
import { GetInvolvedSection } from '@/components/marketing/get-involved-section';
import { SiteFooter } from '@/components/marketing/site-footer';

export default function Index() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <MissionSection />
        <OfferingsSection />
        <GetInvolvedSection />
      </main>
      <SiteFooter />
    </>
  );
}

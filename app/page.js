import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import WhyChooseUs from '@/components/WhyChooseUs';
import Certifications from '@/components/Certifications';
import ServiceExcellence from '@/components/ServiceExcellence';
import Products from '@/components/Products';
import Brands from '@/components/Brands';
import CaseStudies from '@/components/CaseStudies';
import Clients from '@/components/Clients';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyChooseUs />
        <Certifications />
        <ServiceExcellence />
        <Products />
        <Brands />
        <CaseStudies />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Star, BookOpen, MessageCircle } from 'lucide-react';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com imagem opaca e blur */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm scale-105"
        style={{
          backgroundImage: "url('/helicoptero_acidente.jpg')",
          opacity: 0.38,
          zIndex: 1
        }}
      />
      {/* Overlay preto translúcido para contraste extra */}
      <div className="absolute inset-0 z-10" style={{ background: 'rgba(0,0,0,0.38)' }} />
      {/* Overlay azul petróleo com gradiente para profundidade */}
      <div className="absolute inset-0 z-20" style={{
        background: 'linear-gradient(120deg, rgba(30,58,138,0.60) 60%, rgba(76,29,149,0.55) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Ícone minimalista */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-8" style={{ background: 'rgba(249,115,22,0.18)' }}>
            <Star className="w-8 h-8 text-[#4C1D95]" strokeWidth={2} />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_32px_rgba(0,0,0,0.45)]">
            {t('hero.title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-4 font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            {t('hero.subtitle')}
          </p>
          
          <p className="text-lg text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl"
              onClick={() => document.getElementById('projeto')?.scrollIntoView({ behavior: 'smooth' })}
              >
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
              {t('hero.startProject')}
            </Button>
            
            <Button 
              size="lg"
              className="transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl"
              onClick={() => document.getElementById('participar')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
              {t('hero.sendTestimony')}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator minimalista */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
        <div className="w-6 h-10 border-2 border-[#4C1D95]/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#4C1D95]/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

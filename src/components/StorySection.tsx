import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const StorySection = () => {
  const { t } = useTranslation();

  return (
    <section id="projeto" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('story.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Story content */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('story.beforeTitle')}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {t('story.beforeDesc')}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('story.accidentTitle')}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {t('story.accidentDesc')}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('story.afterTitle')}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {t('story.afterDesc')}
              </p>
            </div>
          </div>

          {/* Right side - Images */}
          <div className="flex flex-col items-center justify-center gap-8">
            <img
              src="/jardel_marrone.jpg"
              alt="Jardel e Marrone"
              className="w-full max-w-xs rounded-2xl shadow-2xl transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-cyan-500/50"
            />
            <img
              src="/jardel_bruno.jpg"
              alt="Jardel e Bruno"
              className="w-full max-w-xs rounded-2xl shadow-2xl transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-purple-500/50"
            />
            <img
              src="/IMG_4125.PNG"
              alt="Jardel com sua família"
              className="w-full max-w-xs rounded-2xl shadow-2xl transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-orange-500/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;

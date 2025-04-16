import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, slideIn } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
  link: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "New Summer Collection",
    description: "Discover the latest trends for the season",
    buttonText: "Shop Now",
    imageUrl: "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1600",
    link: "/category/summer-articles"
  },
  {
    id: 2,
    title: "Winter Collection",
    description: "Stay warm with our stylish winter wear",
    buttonText: "Explore Now",
    imageUrl: "https://images.pexels.com/photos/1030946/pexels-photo-1030946.jpeg?auto=compress&cs=tinysrgb&w=1600",
    link: "/category/winter-articles"
  },
  {
    id: 3,
    title: "Party Wear Collection",
    description: "Make a statement at your next event",
    buttonText: "View Collection",
    imageUrl: "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1600",
    link: "/category/party-wear"
  }
];

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % banners.length;
    goToSlide(newIndex);
  };

  const prevSlide = () => {
    const newIndex = (currentSlide - 1 + banners.length) % banners.length;
    goToSlide(newIndex);
  };

  useEffect(() => {
    // Auto-rotate banner
    intervalRef.current = setInterval(nextSlide, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentSlide]);

  return (
    <section className="relative h-[500px] overflow-hidden">
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            className={`absolute top-0 left-0 w-full h-full ${index === currentSlide ? 'z-10' : 'z-0'}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
              transition: { duration: 0.8 }
            }}
          >
            <div className="relative w-full h-full">
              <img 
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <motion.div 
                  className="text-center text-white px-4"
                  initial="hidden"
                  animate={index === currentSlide ? "show" : "hidden"}
                  variants={fadeIn("up")}
                >
                  <motion.h1 
                    className="font-heading font-bold text-4xl md:text-5xl mb-4"
                    variants={slideIn("left", 0.2)}
                  >
                    {banner.title}
                  </motion.h1>
                  <motion.p 
                    className="font-body text-lg md:text-xl mb-6"
                    variants={slideIn("right", 0.3)}
                  >
                    {banner.description}
                  </motion.p>
                  <motion.div variants={fadeIn("up", 0.4)}>
                    <Button 
                      className="bg-[#e53e3e] hover:bg-red-700 text-white font-heading font-medium px-8 py-6 rounded-md"
                      asChild
                    >
                      <a href={banner.link}>{banner.buttonText}</a>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <Button
        onClick={prevSlide}
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full z-20 hover:bg-white"
      >
        <ChevronLeft className="h-5 w-5 text-primary" />
      </Button>
      <Button
        onClick={nextSlide}
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full z-20 hover:bg-white"
      >
        <ChevronRight className="h-5 w-5 text-primary" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;

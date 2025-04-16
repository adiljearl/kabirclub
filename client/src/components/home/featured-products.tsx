import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fadeIn } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ui/product-card';
import { useIsMobile } from '@/hooks/use-mobile';

export const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(0);
  const isMobile = useIsMobile();
  
  const slideWidth = isMobile ? 100 : 25; // 100% for mobile, 25% for desktop (4 items)
  const visibleSlides = isMobile ? 1 : 4;
  
  useEffect(() => {
    if (products) {
      setMaxPosition(Math.max(0, products.length - visibleSlides));
    }
  }, [products, visibleSlides]);
  
  const handlePrev = () => {
    setPosition(prev => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setPosition(prev => Math.min(maxPosition, prev + 1));
  };
  
  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-heading font-bold text-3xl">Featured Products</h2>
            <div className="flex space-x-2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <motion.h2 
            className="font-heading font-bold text-3xl"
            variants={fadeIn()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            Featured Products
          </motion.h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition"
              onClick={handlePrev}
              disabled={position === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition"
              onClick={handleNext}
              disabled={position >= maxPosition}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <div 
            ref={containerRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${position * slideWidth}%)` }}
          >
            {products?.map(product => (
              <div 
                key={product.id} 
                className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-3"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

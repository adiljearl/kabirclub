import { motion } from 'framer-motion';
import { hoverScale } from '@/lib/framer-animations';

interface CategoryCardProps {
  name: string;
  image: string;
}

export const CategoryCard = ({ name, image }: CategoryCardProps) => {
  return (
    <motion.div 
      className="group h-full"
      {...hoverScale}
    >
      <div className="rounded-lg overflow-hidden shadow-md transition-all duration-300 transform group-hover:scale-105 h-full">
        <img 
          src={image}
          alt={name}
          className="w-full h-40 object-cover"
        />
        <div className="p-3 text-center bg-primary text-white font-heading font-medium">
          {name}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryCard;

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { fadeIn, staggerContainer } from '@/lib/framer-animations';
import CategoryCard from '@/components/ui/category-card';
import { useQuery } from '@tanstack/react-query';

export const CategoryBrowser = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Shop By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md bg-gray-200 animate-pulse">
                <div className="w-full h-40"></div>
                <div className="p-3 text-center bg-gray-300 h-8"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="font-heading font-bold text-3xl text-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeIn()}
        >
          Shop By Category
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {categories?.map((category) => (
            <motion.div 
              key={category.id}
              variants={fadeIn("up")}
            >
              <Link href={`/category/${category.slug}`}>
                <CategoryCard 
                  name={category.name} 
                  image={category.imageUrl} 
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryBrowser;

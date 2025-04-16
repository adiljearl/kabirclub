import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/framer-animations';
import { Truck, RotateCcw, Lock, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free shipping on all orders over $50"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30 days return policy for all items"
  },
  {
    icon: Lock,
    title: "Secure Payment",
    description: "Your payments are safe with our secure payment system"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our customer support team is available to help you"
  }
];

export const FeatureBlocks = () => {
  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
              variants={fadeIn("up", index * 0.1)}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-primary text-2xl" />
              </div>
              <h3 className="font-heading font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-neutral-500 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureBlocks;

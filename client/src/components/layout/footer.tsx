import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { fadeIn, staggerContainer } from '@/lib/framer-animations';
import Logo from '@/components/ui/logo';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  MapPin, 
  Phone, 
  Mail 
} from 'lucide-react';

const categories = [
  { name: "Summer Articles", slug: "summer-articles" },
  { name: "Winter Articles", slug: "winter-articles" },
  { name: "Party Wear", slug: "party-wear" },
  { name: "Bottom Wear", slug: "bottom-wear" },
  { name: "Track Suits", slug: "track-suits" },
];

const information = [
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
  { name: "Terms & Conditions", path: "/terms" },
  { name: "Returns & Exchanges", path: "/returns" },
  { name: "Shipping & Delivery", path: "/shipping" },
];

export const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* About */}
          <motion.div variants={fadeIn("up")}>
            <h3 className="font-heading font-bold text-xl mb-4">About Kabir Club</h3>
            <p className="text-neutral-300 mb-4">
              We're dedicated to providing the latest fashion trends with high-quality garments at affordable prices.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-white hover:text-[#e53e3e] transition"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-[#e53e3e] transition"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-[#e53e3e] transition"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </motion.div>
          
          {/* Categories */}
          <motion.div variants={fadeIn("up", 0.1)}>
            <h3 className="font-heading font-bold text-xl mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.slug}>
                  <Link 
                    href={`/category/${category.slug}`} 
                    className="text-neutral-300 hover:text-[#e53e3e] transition"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Information */}
          <motion.div variants={fadeIn("up", 0.2)}>
            <h3 className="font-heading font-bold text-xl mb-4">Information</h3>
            <ul className="space-y-2">
              {information.map(item => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="text-neutral-300 hover:text-[#e53e3e] transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Contact */}
          <motion.div variants={fadeIn("up", 0.3)}>
            <h3 className="font-heading font-bold text-xl mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <MapPin className="mt-1 text-[#e53e3e]" size={18} />
                <span className="text-neutral-300">Tower A, Hamraz Complex Kanpur, UP, India, IN 208001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-[#e53e3e]" size={18} />
                <span className="text-neutral-300">+91 9670 433 355</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-[#e53e3e]" size={18} />
                <span className="text-neutral-300">info@adilclub.com</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
        
        <hr className="border-neutral-700 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Kabir Club. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <svg className="h-6" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" fill="#F3F4F6"/>
              <path d="M12 12H28V13H12V12Z" fill="#1F2937"/>
            </svg>
            <svg className="h-6" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" fill="#F3F4F6"/>
              <path d="M12 12H28V13H12V12Z" fill="#1F2937"/>
            </svg>
            <svg className="h-6" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" fill="#F3F4F6"/>
              <path d="M12 12H28V13H12V12Z" fill="#1F2937"/>
            </svg>
            <svg className="h-6" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="25" fill="#F3F4F6"/>
              <path d="M12 12H28V13H12V12Z" fill="#1F2937"/>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

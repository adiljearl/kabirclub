import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideIn } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth-context';

// Define cart item type to fix TypeScript errors
interface CartItem {
  id: number;
  // productId: number;
  quantity: number;
  sessionId: string;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    [key: string]: any;
  };
}

const navLinks = [
  { name: "Summer Articles", slug: "summer-articles" },
  { name: "Winter Articles", slug: "winter-articles" },
  { name: "Party Wear", slug: "party-wear" },
  { name: "Bottom Wear", slug: "bottom-wear" },
  { name: "Track Suits", slug: "track-suits" },
  { name: "Accessories", slug: "accessories" },
  { name: "Contact Us", slug: "contact" },
];

export const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuth();

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
  });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const cartCount = cartItems.length || 0;

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map(link => (
              <Link 
                key={link.slug} 
                href={link.slug === "contact" ? "/contact" : `/category/${link.slug}`}
                className={`font-heading font-medium text-sm text-primary hover:text-[#e53e3e] transition 
                  ${location === (link.slug === "contact" ? "/contact" : `/category/${link.slug}`) ? "text-[#e53e3e]" : ""}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center text-primary" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
          </button>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="text-primary hover:text-[#e53e3e]" asChild>
                  <Link href="/account">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary hover:text-[#e53e3e]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" className="text-primary hover:text-[#e53e3e]" asChild>
                <Link href="/login">
                  Login / Register
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-primary hover:text-[#e53e3e] relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#e53e3e] text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={slideIn("down")}
          >
            <div className="container mx-auto px-4 py-3 space-y-4">
              {navLinks.map(link => (
                <Link 
                  key={link.slug} 
                  href={link.slug === "contact" ? "/contact" : `/category/${link.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block font-heading font-medium text-sm text-primary hover:text-[#e53e3e] py-2 border-b border-neutral-200
                    ${location === (link.slug === "contact" ? "/contact" : `/category/${link.slug}`) ? "text-[#e53e3e]" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="flex space-x-4 py-2">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-[#e53e3e]" asChild>
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-primary hover:text-[#e53e3e]"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="text-primary hover:text-[#e53e3e]" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login / Register
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-primary hover:text-[#e53e3e] relative" asChild>
                  <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#e53e3e] text-white text-xs flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

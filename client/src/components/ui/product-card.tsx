import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hoverScale } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, ShoppingCart, Star, StarHalf } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);
  
  const { 
    id, 
    name, 
    price, 
    imageUrl, 
  } = product;
  
  const addToCart = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', { productId: id, quantity: 1 });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Could not add to cart. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const [location, setLocation] = useLocation();
  // console.log("WHAT IS LOCATION1", location);
  // const handleLocation = () => {
    // console.log("WHAT IS LOCATION", location);
    // setLocation(`/product/${id}`);
  // }

  return (
    <motion.div
      {...hoverScale}
      className="h-full"
    >
      <Card className="rounded-lg overflow-hidden shadow-md product-card h-full">
        <div 
          onClick={() => setLocation(`/product/${id}`)}
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        <img 
          src={imageUrl}
          alt={name}
          // height={100}
          className="w-full h-full object-cover cursor-pointer"
        />


          
          {/* Quick actions overlay */}
          <div 
            className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center space-x-2 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-[#e53e3e] hover:text-white transition"
              asChild
            >
              <Link href={`/product/${id}`}>
                <Eye size={16} />
              </Link>
            </Button> */}
            {/* <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-[#e53e3e] hover:text-white transition"
            >
              <Heart size={16} />
            </Button> */}
            {/* <Button 
              variant="outline" 
              size="icon" 
              className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-[#e53e3e] hover:text-white transition"
              onClick={() => addToCart.mutate()}
              disabled={addToCart.isPending}
            >
              <ShoppingCart size={16} />
            </Button> */}
          </div>
          
          {/* Badge */}
          {/* {badge && (
            <div className="absolute top-2 left-2">
              <span className={`${getBadgeColor()} text-white text-xs px-2 py-1 rounded`}>{badge}</span>
            </div>
          )} */}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-heading font-medium text-lg mb-1">{name}</h3>
          {/* <div className="flex items-center space-x-1 mb-2">
            {renderStars()}
            <span className="text-neutral-500 text-sm">({reviewCount})</span>
          </div> */}
          <div className="flex justify-between items-center">
            <div className="font-heading font-bold text-lg">
              {/* {originalPrice ? (
                <>
                  <span className="text-[#e53e3e]">${price.toFixed(2)}</span>
                  <span className="text-neutral-400 line-through text-sm ml-1">${originalPrice.toFixed(2)}</span>
                </>
              ) : ( */}
                <span>Rs {price.toFixed(2)}</span>
              {/* )} */}
            </div>
            <Button 
              variant="default" 
              className="bg-primary text-white text-sm px-3 py-1 rounded hover:bg-[#e53e3e] transition"
              onClick={() => addToCart.mutate()}
              disabled={addToCart.isPending}
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;

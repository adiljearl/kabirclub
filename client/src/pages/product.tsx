import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  Minus,
  Plus,
  ChevronRight,
  ShoppingCart,
  Heart,
  Share2,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import FeaturedProducts from '@/components/home/featured-products';

export const Product = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  // const [showSizeChart, setShowSizeChart] = useState(false); // Toggle for size chart

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/product/${id}`],
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!selectedSize) {
        throw new Error('Please select size before adding to cart.');
      }
      const response = await fetch('/api/cart',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: id,
          quantity: quantity,
          size: selectedSize,
        }),
      });
      // console.log("CART RESPONSE:", response);
      // return apiRequest('POST', '/api/cart', {
      //   product_id: id,
      //   quantity: quantity,
      //   size: selectedSize,
      // });
    },
    onSuccess: () => {
      toast({
        title: 'Added to cart',
        description: `${product.productname} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Could not add to cart. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-[500px] bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p>Sorry, we couldn't find the product you're looking for.</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract available sizes from productsizes
  const availableSizes = Object.keys(product.productsizes || {}).filter(
    (size) => product.productsizes[size]
  );

  return (
    <>
      {/* Breadcrumbs */}
      <div className="bg-neutral-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-neutral-500">
            <Link href="/">
              <a className="hover:text-[#e53e3e]">Home</a>
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link href={`/category/${product.categoryslug}`}>
              <a className="hover:text-[#e53e3e]">{product.categoryname}</a>
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-neutral-700">{product.productname}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image */}
          <motion.div
            className="w-full md:w-1/3"
            initial="hidden"
            animate="show"
            variants={fadeIn('right')}
          >
            <img
              src={product.imageurl || '/placeholder-image.jpg'}
              alt={product.productname}
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="w-full md:w-1/2 space-y-6"
            initial="hidden"
            animate="show"
            variants={fadeIn('left')}
          >
            <h1 className="text-3xl font-bold">{product.productname}</h1>
            <p className="text-neutral-500">{product.productdescription}</p>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium mb-2">Select Size</h3>
                {/* <button
                  onClick={() => setShowSizeChart(!showSizeChart)}
                  className="text-sm text-[#e53e3e] underline"
                >
                  {showSizeChart ? 'Hide Size Chart' : 'View Size Chart'}
                </button> */}
              </div>
              <div className="flex space-x-2">
              {availableSizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    className="w-10 h-10 rounded-md"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>

              {/* Size Chart */}
              {(
                <div className="mt-4 bg-neutral-100 p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-2">Size Chart (in inches)</h3>

                  {/* Shirt Size Chart */}
                  <div className="overflow-x-auto mb-6">
                    <h4 className="text-md font-semibold mb-2">Shirt Sizes</h4>
                    <table className="table-auto w-full border-collapse border border-neutral-300">
                      <thead className="bg-neutral-200 text-neutral-700">
                        <tr>
                          <th className="px-4 py-2 border">Size</th>
                          <th className="px-4 py-2 border">Chest</th>
                          <th className="px-4 py-2 border">Length</th>
                          <th className="px-4 py-2 border">Shoulder</th>
                        </tr>
                      </thead>
                      <tbody className="text-neutral-600">
                        <tr>
                          <td className="px-4 py-2 border">S</td>
                          <td className="px-4 py-2 border">36</td>
                          <td className="px-4 py-2 border">27</td>
                          <td className="px-4 py-2 border">17</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">M</td>
                          <td className="px-4 py-2 border">38</td>
                          <td className="px-4 py-2 border">28</td>
                          <td className="px-4 py-2 border">18</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">L</td>
                          <td className="px-4 py-2 border">40</td>
                          <td className="px-4 py-2 border">29</td>
                          <td className="px-4 py-2 border">19</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">XL</td>
                          <td className="px-4 py-2 border">42</td>
                          <td className="px-4 py-2 border">30</td>
                          <td className="px-4 py-2 border">20</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">XXL</td>
                          <td className="px-4 py-2 border">44</td>
                          <td className="px-4 py-2 border">31</td>
                          <td className="px-4 py-2 border">21</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pants Size Chart */}
                  <div className="overflow-x-auto">
                    <h4 className="text-md font-semibold mb-2">Pant Sizes</h4>
                    <table className="table-auto w-full border-collapse border border-neutral-300">
                      <thead className="bg-neutral-200 text-neutral-700">
                        <tr>
                          <th className="px-4 py-2 border">Size</th>
                          <th className="px-4 py-2 border">Waist</th>
                          <th className="px-4 py-2 border">Length</th>
                        </tr>
                      </thead>
                      <tbody className="text-neutral-600">
                        <tr>
                          <td className="px-4 py-2 border">S</td>
                          <td className="px-4 py-2 border">30</td>
                          <td className="px-4 py-2 border">40</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">M</td>
                          <td className="px-4 py-2 border">32</td>
                          <td className="px-4 py-2 border">41</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">L</td>
                          <td className="px-4 py-2 border">34</td>
                          <td className="px-4 py-2 border">42</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">XL</td>
                          <td className="px-4 py-2 border">36</td>
                          <td className="px-4 py-2 border">43</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border">XXL</td>
                          <td className="px-4 py-2 border">38</td>
                          <td className="px-4 py-2 border">44</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              )}
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Price:</h3>
              <h1>Rs {product.productprice}</h1>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </Button>
                <div className="w-12 h-10 flex items-center justify-center border">
                  {quantity}
                </div>
                <Button variant="outline" size="icon" onClick={increaseQuantity}>
                  <Plus size={16} />
                </Button>
              </div>

              <Button
                className="bg-primary hover:bg-[#e53e3e] text-white px-8 py-3 flex items-center space-x-2"
                onClick={() => addToCart.mutate()}
                disabled={addToCart.isPending}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </Button>
            </div>

            {/* Wishlist and Share */}
            {/* <div className="flex space-x-4 mt-6">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Heart size={18} />
                <span>Add to Wishlist</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Share2 size={18} />
                <span>Share</span>
              </Button>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* You May Also Like */}
      <div className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">You May Also Like</h2>
          <FeaturedProducts />
        </div>
      </div>
    </>
  );
};

export default Product;

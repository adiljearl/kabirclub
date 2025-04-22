import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cart_items } from '@shared/schema';

export const Cart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart_items, isLoading } = useQuery({
    queryKey: ['/api/cart'],
  });

  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await fetch('/api/cart/${id}',{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          quantity: quantity,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeCartItem = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch('/api/cart/${id}',{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
        }),
      })
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

//Clear cart
  const removeAllCartItems = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch('/api/cart',{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateCartItem.mutate({ id, quantity: newQuantity });
  };

  const cart_items_Array = cart_items ? Object.values(cart_items) : [];
  // console.log("IS IT ARRAY NOW ?", Array.isArray(cart_items_Array));

  let subtotal = 0;
  cart_items_Array.forEach((items) => {
    subtotal+=items.productprice*items.itemquantity;
  })
  
  // const subtotal = calculateSubtotal();
  // console.log("Total Price:", totalPrice);
  const shipping = (subtotal < 1500 && subtotal > 0) ? 120 : 0;
  const tax = subtotal * 0.14;
  const grandTotal = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">Your Cart</h1>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-20 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-20 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-20 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  if (!cart_items) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="text-center max-w-lg mx-auto"
          initial="hidden"
          animate="show"
          variants={fadeIn()}
        >
          <ShoppingCart className="mx-auto h-16 w-16 text-neutral-300 mb-4" />
          <h1 className="text-3xl font-heading font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-neutral-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Button className="bg-primary hover:bg-[#e53e3e] text-white" asChild>
            <Link href="/">
              <span className="flex items-center">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }
  // console.log("CART ITEMSSSSSS", cart_items);
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1 
        className="text-3xl font-heading font-bold mb-8"
        initial="hidden"
        animate="show"
        variants={fadeIn()}
      >
        Your Cart
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div 
          className="lg:w-2/3"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart_items.map((items) => (
                    <motion.tr 
                      key={items.productname}  // Assuming product names are unique
                      variants={fadeIn("up")}
                      className="border-b"
                    >
                      {/* Product Image */}
                      <TableCell>
                        <img 
                          src={items.productimage} 
                          alt={items.productname} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>

                      {/* Product Name */}
                      <TableCell className="font-medium">
                        <Link href={`/product/${items.productname}`}>
                          <a className="hover:text-[#e53e3e] transition">
                            {items.productname}
                          </a>
                        </Link>
                      </TableCell>

                      {/* Product Price */}
                      <TableCell>Rs {items.productprice.toFixed(2)}</TableCell>

                      {/* Size */}
                      <TableCell>{items.itemsize}</TableCell>

                      {/* Quantity Controls */}
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(items.cartitemsid, items.itemquantity, -1)}
                            disabled={items.itemquantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{items.itemquantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(items.cartitemsid, items.itemquantity, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Total Price (Price × Quantity) */}
                      <TableCell className="font-medium">
                        Rs. {(items.productprice * items.itemquantity).toFixed(2)}
                      </TableCell>

                      {/* Remove Button */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-neutral-500 hover:text-red-500"
                          onClick={() => removeCartItem.mutate(items.cartitemsid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>

              </Table>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/">
                <span className="flex items-center">
                  Continue Shopping
                </span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="text-red-500 hover:bg-red-50"
              onClick={() => removeAllCartItems.mutate()}
            >
              Clear Cart
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:w-1/3"
          initial="hidden"
          animate="show"
          variants={fadeIn("left")}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium">Rs {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax</span>
                  <span className="font-medium">Rs {tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between">
                  <span className="font-heading font-bold">Total</span>
                  <span className="font-heading font-bold">Rs {grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
               <Button 
                  className="w-full bg-primary hover:bg-[#e53e3e] text-white"
                  onClick={() => {
                    if (cart_items_Array.length === 0) {
                      toast({
                        title: "Cart is empty",
                        description: "Please add items to your cart before finalising the deal.",
                        variant: "destructive",
                      });
                      return;
                    }

                    const messageLines = cart_items_Array.map(item => (
                      `🛍️ *${item.productname}*\nSize: ${item.itemsize}\nQty: ${item.itemquantity}\nPrice: ₹${item.productprice}\nSubtotal: ₹${item.itemquantity * item.productprice}`
                    ));

                    const message = `Hello! I’d like to finalize this order from kabirclub:\n\n${messageLines.join('\n\n')}\n\n📦 *Total*: ₹${grandTotal.toFixed(2)} (Including tax and shipping)`;
                    // const message = 'hello';
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/919670433355?text=${encodedMessage}`; // Replace with your number

                    window.open(whatsappUrl, '_blank');
                  }}
                  >
                  Finalise the deal
              </Button>


              {/* <Button className="w-full bg-primary hover:bg-[#e53e3e] text-white"> */}
                {/* <CreditCard className="mr-2 h-4 w-4" /> */}
                {/* finalize the deal */}
              {/* </Button> */}
              
              {/* <div className="mt-6 text-sm text-neutral-500">
                <p className="mb-2">We accept:</p>
                <div className="flex space-x-2">
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
              </div> */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;

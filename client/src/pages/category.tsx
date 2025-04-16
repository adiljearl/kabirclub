import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/framer-animations';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from '@/components/ui/product-card';

export const Category = () => {
  const { slug } = useParams();
  const [sortBy, setSortBy] = useState("featured");

  // const [page, setPage] = useState(1);
  // const limit = 8; // items per page

  
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: [`/api/categories/${slug}`],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/products/category/${slug}?`],
  });
  
  const isLoading = categoryLoading || productsLoading;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse mb-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
    );
  }
  
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "best-rated", label: "Best Rated" },
  ];
  
  const filterOptions = [
    {
      id: "price",
      name: "Price Range",
      options: [
        { id: "0-25", label: "Under $25" },
        { id: "25-50", label: "$25 to $50" },
        { id: "50-100", label: "$50 to $100" },
        { id: "100-200", label: "$100 to $200" },
        { id: "200-plus", label: "$200 & Above" }
      ]
    },
    {
      id: "size",
      name: "Size",
      options: [
        { id: "xs", label: "XS" },
        { id: "s", label: "S" },
        { id: "m", label: "M" },
        { id: "l", label: "L" },
        { id: "xl", label: "XL" },
        { id: "xxl", label: "XXL" }
      ]
    },
    {
      id: "itemtype",
      name: "Type",
      options: [
        { id: "SH-001", label: "Shirt" },
        { id: "PN-001", label: "Pants" },
        { id: "JK-001", label: "Jacket" },
        { id: "TR-001", label: "Trouser" },
        { id: "TS-001", label: "Track Suit" }
      ]
    }
  ];
  
  return (
    <>
      <div className="bg-neutral-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-neutral-500">
            <Link href="/">
              <a className="hover:text-[#e53e3e]">Home</a>
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-neutral-700">{category[0]?.name}</span>
          </div>
        </div>
      </div>
    
      <div className="container mx-auto px-4 py-8">
        {/* <motion.h1 
          className="text-3xl font-heading font-bold mb-6"
          initial="hidden"
          animate="show"
          variants={fadeIn()}
        >
          {category[0]?.name}
        </motion.h1> */}
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          {/* Mobile Filters */}
          <div className="mb-4 w-full md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filter Products
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Narrow down your product search with these filters.
                  </SheetDescription>
                </SheetHeader>
                {/* <div className="py-4">
                  {filterOptions.map((filter) => (
                    <Accordion key={filter.id} type="single" collapsible className="w-full">
                      <AccordionItem value={filter.id}>
                        <AccordionTrigger>{filter.name}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {filter.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox id={`mobile-${filter.id}-${option.id}`} />
                                <label
                                  htmlFor={`mobile-${filter.id}-${option.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div> */}
                <div className="flex justify-between mt-4">
                  <Button variant="outline">Clear All</Button>
                  <Button>Apply Filters</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Filters */}
          {/* <div className="hidden md:block w-1/6">
            <h3 className="text-xl font-heading font-medium mb-4">Filters</h3>
            {filterOptions.map((filter) => (
              <div key={filter.id} className="mb-6">
                <h4 className="font-medium mb-3">{filter.name}</h4>
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox id={`desktop-${filter.id}-${option.id}`} />
                      <label
                        htmlFor={`desktop-${filter.id}-${option.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button className="w-full mb-2">Apply Filters</Button>
            <Button variant="outline" className="w-full">Clear All</Button>
          </div> */}
          
          {/* Products */}
          <div className="w-full md:w-full md:pl-8">
            {/* <div className="flex justify-between items-center mb-6">
              <p className="text-neutral-600">{products?.length} products</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {products?.map(product => (
                <motion.div 
                  key={product.id}
                  variants={fadeIn("up")}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="mx-1 px-4">1</Button>
              <Button variant="outline" className="mx-1 px-4">2</Button>
              <Button variant="outline" className="mx-1 px-4">3</Button>
              <Button variant="outline" className="mx-1 px-4">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;

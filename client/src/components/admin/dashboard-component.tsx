import React, { useState, useEffect } from 'react';
// import {db} from '../../../../db';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Category from '@/pages/category';
import axios from 'axios';
import { navigate } from 'wouter/use-browser-location';
import { categories } from '@shared/schema';

// Available sizes
const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Main Admin Dashboard Component
export const AdminDashboard = () => {   //make it use slug for more reliability
  const [categories, setCategories] = useState([
    'Summer Articles', 
    'Winter Articles', 
    'Party Wear', 
    'Bottom Wear',
    'Track Suits', 
    'Accessories'
  ]);

  const [isFormVisible,setFormisVisible] = useState(false);
  
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [products, setProducts] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Fetch products for all categories
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const productsData = {};
        for (const category of categories) {
          const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
          const categoryProducts = await response.json();
          // console.log(categoryProducts);
          productsData[category] = categoryProducts;
        }
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchAllProducts();
  }, []);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Handler to open product modal for adding/editing
  const handleOpenProductModal = (product = null, category = null) => {
    setCurrentProduct(product);
    if(category)
      setExpandedCategory(category);
    setIsProductModalOpen(true);
  };

  // Handler to save product
  const handleSaveProduct = async (productData) => {
    try {
      const url = currentProduct 
        ? `/api/products/${currentProduct.id}` 
        : '/api/products';
        // console.log("WHAT IS URL",url);

      const method = currentProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          category: currentProduct?.category || expandedCategory,
          expandedCategory
        })
      });

      if (response.ok) {
        // Refresh products list
        const updatedProduct = await response.json();
        
        // Update local state
        const updatedProducts = {...products};
        const categoryProducts = updatedProducts[updatedProduct.category] || [];
        
        if (currentProduct) {
          // Update existing product
          const productIndex = categoryProducts.findIndex(p => p.id === currentProduct.id);
          if (productIndex !== -1) {
            categoryProducts[productIndex] = updatedProduct;
          }
        } else {
          // Add new product
          categoryProducts.push(updatedProduct);
        }
        
        updatedProducts[updatedProduct.category] = categoryProducts;
        setProducts(updatedProducts);
        setIsProductModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  }; 

  // Handler to delete product
  const handleDeleteProduct = async (productId, category) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove product from local state
        const updatedProducts = {...products};
        updatedProducts[category] = updatedProducts[category].filter(p => p.id !== productId);
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Categories Accordion */}
      {categories.map(category => (
        <div key={category} className="border rounded-lg mb-4">
          <div 
            className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer hover:bg-gray-200"
            onClick={() => toggleCategory(category)}
          >
            <h2 className="text-xl font-semibold">{category}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenProductModal(null, category);
                // console.log("EXPANDED CATEGORY", category);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
          
          {/* Products Grid */}
          {expandedCategory === category && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {products[category]?.map(product => (
                <div 
                  key={product.id} 
                  className="border rounded-lg p-4 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="mb-4 h-48 w-full">
                    <img 
                      src={product.image_url || '/api/placeholder/300/200'} 
                      alt={product.name} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <p className="text-gray-600">Price: Rs {product.price}</p>
                    <p className="text-gray-600">Stock: {product.stock_quantity}</p>
                    {/* <p className="text-gray-600">Product Id: {product.productId}</p> */}
                    <p className="text-gray-600">Category Id: {product.category_id}</p>
                    
                    {/* Sizes */}
                    <div className="mt-2">
                      <p className="text-gray-600">Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes && Object.entries(product.sizes)
                          .filter(([_, available]) => available)
                          .map(([size]) => (
                            <span 
                              key={size} 
                              className="bg-gray-200 px-2 py-1 rounded text-xs"
                            >
                              {size}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Actions */}
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenProductModal(product)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id, category)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Product Modal */}
      <Dialog 
        open={isProductModalOpen} 
        onOpenChange={setIsProductModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={currentProduct} 
            onSave={handleSaveProduct}
            onCancel={() => setIsProductModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || 'Kabir Club Article',
    featured: product?.featured || false,
    trending: product?.trending || false,
    item_id: product?.item_id || 'SH-001',
    price: product?.price || '0',
    stockQuantity: product?.stock_quantity || 1,
    description: product?.description || '',
    imageUrl: product?.image_url || '',
    sizes: product?.sizes || AVAILABLE_SIZES.reduce((acc, size) => {
      acc[size] = false;
      return acc;
    }, {})
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: !prev.sizes[size]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Product Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      {/* <Input
        name="categoryId"
        placeholder="Category Id"
        value={formData.categoryId}
        onChange={handleChange}
        required
      /> */}
      <Input
        name="price"
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
      />
      <Input
        name="stockQuantity"
        type="number"
        placeholder="Stock Quantity"
        value={formData.stockQuantity}
        onChange={handleChange}
        required
      />
      <Input
        name="description"
        placeholder="Product Description"
        value={formData.description}
        onChange={handleChange}
      />
      <Input
        name="imageUrl"
        placeholder="Image URL"
        value={formData.imageUrl}
        onChange={handleChange}
      />
      <select
        name="featured"
        value={formData.featured}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53e3e] focus:border-transparent">
        <option value="true">Featured</option>
        <option value="false">Not Featured</option>
      </select>
      <select
        name="trending"
        value={formData.trending}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53e3e] focus:border-transparent">
        <option value="true">Trending</option>
        <option value="false">Not Trending</option>
      </select>
      <select
        name="item_id"
        value={formData.item_id}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e53e3e] focus:border-transparent">
        <option value="SH-001">Shirt</option>
        <option value="PN-001">Pants</option>
        <option value="JK-001">Jacket</option>
        <option value="TR-001">Trouser</option>
        <option value="TS-001">Track Suit</option>
      </select>
      {/* Size Selection */}
      <div>
        <label className="block mb-2 text-sm font-medium">Available Sizes</label>
        <div className="flex flex-wrap gap-4">
          {AVAILABLE_SIZES.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={formData.sizes[size]}
                onCheckedChange={() => handleSizeChange(size)}
              />
              <label 
                htmlFor={`size-${size}`}
                className="text-sm font-medium leading-none"
              >
                {size}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Product
        </Button>
      </div>
    </form>
  );
};

// import express from 'express';
// import { db } from '../db';
// import { products, categories } from '../shared/schema';
// import {eq} from 'drizzle-orm';

// const router = express.Router();

// // Get products grouped by category
// router.get('/all', async (req, res) => {
//   try {
//     const productData = await db
//       .select({
//         id: products.id,
//         name: products.name,
//         price: products.price,
//         stockQuantity: products.stockQuantity,
//         productId: products.productId,
//         imageUrl: products.imageUrl,
//         category: categories.name,
//       })
//       .from(products)
//       .innerJoin(categories, eq(categories.id, products.productId))
//       .orderBy(categories.name);

// // Define a product type (if not already defined)
//     type Product = {
//         id: number;
//         name: string;
//         price: number;
//         stock: number;
//         sku: string;
//         image: string;
//         category: string;
//     };
    
//     // Reduce with typed accumulator
//     const groupedProducts = productData.reduce<Record<string, Product[]>>((acc, product) => {
//         if (!acc[product.category]) {
//         acc[product.category] = [];
//         }
//         acc[product.category].push({...product, stock: product.stock ? 0,});
//         return acc;
//     }, {});
  

//     res.json(groupedProducts);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ message: 'Error fetching products' });
//   }
// });

// export default router;

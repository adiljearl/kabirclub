import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {desc, eq} from 'drizzle-orm';
import { z } from "zod";
import {pool} from '../db';
import {cart_items} from "@shared/schema";

import { 
  insertWaitlistSchema, 
  insertContactMessageSchema,
  // insertCartItemSchema,
  insertProductSchema,
  categories,
  products,
  users,
  insertCartItemSchema,
  // products
} from "@shared/schema";
// import { isAdmin } from "./auth";
import crypto from "crypto";
import { db } from "db";
import { redirect } from "react-router-dom";

// Helper function to get session ID from request
const getSessionId = (req: Request): string => {
  if (!req.session?.id) {
    // Generate a random session ID if none exists
    req.session = req.session || {};
    req.session.id = crypto.randomUUID();
  }
  console.log("SESSION ID", req.session.id);
  return req.session.id;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      // console.log("IN /api/categories/:slug", req.query);
      const pageNumber = req.query.page;
      const limitNumber = req.query.limit;
      // console.log("WHAt IS pageNumber and limit", pageNumber,limitNumber);
      const { slug } = req.params;
      const category = await db.select().from(categories).where(eq(categories.slug,slug));
      // console.log("print category", category);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Products in dropdown
  app.get('/api/products', async (req, res) => {
    const categoryFromDB = await db.select({category: categories.id})
    .from(categories)
    .where(eq(categories.name,req.query.category));
    try {
      const { rows } = await pool.query(
        'SELECT * FROM products WHERE category_id = $1', 
        [categoryFromDB[0]?.category]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//Delete product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, price, stockQuantity, description, imageUrl, sizes, featured,trending,item_id } = req.body;
  // console.log("REQ BODY IN PUT CALL",req.body);

  const catID = await db.select({id:categories.id}).from(categories).where(eq(req.body.expandedCategory,categories.name));
  console.log("WHAT IS CATIDDDDD", catID[0].id);
  try {
    const booleanFeature = featured === true || featured === 'true';
    const booleanTrending = trending === true || trending === 'true';
    const { rows } = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        category_id = $2,
        price = $3,
        stock_quantity = $4,
        description = $5,
        image_url = $6,
        sizes = $7,
        featured = $8,
        trending = $9,
        item_id = $10
      WHERE id = $11
      RETURNING *
      `,
      [
        name,
        catID[0].id,
        price,
        stockQuantity,
        description,
        imageUrl,
        JSON.stringify(sizes), // Ensuring sizes are stored as JSON
        booleanFeature, // Correct boolean value passed
        booleanTrending,
        item_id,
        id,
      ]
    );
    console.log('Updated Row:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ error: error.message });
  }
});


  //display featured products
  app.get("/api/products/featured", async (_req: Request, res: Response) => {
    try {
      const x = await db.select().from(products).where(eq(products.featured,true));
      res.json(x);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  //display trending products
  app.get("/api/products/trending", async (_req: Request, res: Response) => {
    try {
      const x = await db.select().from(products).where(eq(products.trending,true));
      res.json(x);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await db.select()
      .from(products)
      .where(eq(products.id, id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get the product's category for the breadcrumb
      const category = await storage.getCategoryBySlug(
        (await storage.getCategories()).find(c => c.id === product.categoryId)?.slug || ""
      );
      
      res.json({
        ...product,
        category: category || null
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/category/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await db.select().from(categories).where(eq(categories.slug,slug));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const categoryID = await db.select({id:categories.id}).from(categories).where(eq(categories.slug,slug));
      const productsByCategory = await db.select().from(products).where(eq(products.categoryId,categoryID[0].id));

      res.json(productsByCategory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/product/:id", async (req: Request, res: Response) => {
    const {id} = req.params;
    try{
      const {rows} = await pool.query(
        `SELECT
        products.name AS productName,
        products.price AS productPrice,
        products.image_url AS imageUrl,
        products.description AS productDescription,
        products.sizes AS productSizes,
        categories.name AS categoryName,
        categories.slug AS categorySlug
        FROM products
        INNER JOIN
        categories
        ON products.category_id = categories.id
        WHERE products.id = $1`,
        [id]
      )
      if(rows.length === 0){
        return res.status(404).json({message: "Product not found"});
      }
      res.json(rows[0]);
    } catch (error: any){
      res.status(500).json({message: error.message});
    }
  });

  app.get("/api/isAdmin", async (req: Request, res: Response) => {
    try{
      const currUser = req.user.role;
      if(currUser == undefined)
        console.log("user is undefined");
    }
    catch(error: any)
    {
      console.log('INSIDE CATCH');
      res.status(500).json({message: error.message});
    }

  })

  // view cart
  app.get("/api/cart", async (req: Request, res: Response) => {
    // console.log("VIEW CART API CALL");
    try {
      if(!req.isAuthenticated())
      {
        return res.status(401).json({
          success: false,
          message: 'Not Authenticated'
        });
      }
      const userid = req.user.id;
      // const result = insertCartItemSchema.safeParse(req.body);
      // console.log("CART RESULT",req.body);
      // console.log("USES ID:::", userid);
      // const sessionId = getSessionId(req);
      // const cartItems = await storage.getCartItems(sessionId);
      // const cartItems = await db.select().from(cart_items).where(eq(cart_items.user_id,req.user.id));
      // console.log("CART ITEMS", cartItems);
      const {rows} = await pool.query(
        `SELECT 
          products.image_url as productImage,
          products.name as productName,
          products.price as productPrice,
          cart_items.id as cartitemsid,
          cart_items.size as itemSize,
          cart_items.quantity as itemQuantity 
          FROM cart_items 
          INNER JOIN
          products
          ON products.id = cart_items.product_id
          WHERE cart_items.user_id=$1;`,
          [userid]
      )
      // console.log("DB QUERY RESULT",rows);
      res.json(rows);
      // res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add item in cart for the logged in user
  app.post("/api/cart", async (req: Request, res: Response) => {
    // console.log("THIS POST CALL SHOULD WORK");
    try {
      // const sessionId = getSessionId(req);
      if(!req.isAuthenticated())
        {
          return res.status(401).json({
            success: false,
            message: 'Not Authenticated'
          });
        }
      const userid = req.user.id;
      const result = insertCartItemSchema.safeParse(req.body);
      const {product_id,quantity,size} = req.body;
      const addedItem = await db.insert(cart_items)
      .values({
        product_id: product_id,
        quantity: quantity,
        size: size,
        user_id: req.user.id

      });
      res.status(201).json(addedItem);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: error.message });
    }
  });


  app.put("/api/cart/:id",async (req,res) => {
    // console.log("BODY REQ VALUE", req.body);
    const {id,quantity} = req.body;
    try{
      const {rows} = await pool.query(
        `UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING *;`,
        [quantity,id]
      )
      res.status(201).json({message: "Quantity of your item updated successfully."});
    } catch (error: any){
      res.status(500).json({message: error.message});
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    // console.log("DELETE ITEM FROM CART",req.body);
    try {
      const {id} = req.body;
      const res = await pool.query(
        `DElETE
        FROM cart_items
        WHERE id = $1`,
        [id]
      )
      res.status(201).json({message: "Item has been removed successfully"});
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  //clear cart
  app.delete("/api/cart/", async (req: Request, res: Response) => {
    // console.log("CLEAR CART API");
    try{
      const id = req.user.id;
      console.log("CURRENT user is",id);
      const response = await pool.query(
        `DELETE
        FROM cart_items
        WHERE user_id = $1`,
        [id]
      )
      response.status(201).json({message: "Cleared your cart"});
    } catch(error: any){
      res.status(500).json({error: error.message});
    }
  })

  //add new product
  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      console.log("REQ IN BODY", req.body);
      console.log("REQ PARAMS", req.params);
      const result = insertProductSchema.safeParse(req.body);
      console.log("WORKING UP UNTILL HERE1");
      if(!result.success){
        console.error("Validation Errors:", JSON.stringify(result.error.format(), null, 2));
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: result.error.format(),
        });
      }
      console.log("WORKING UP UNTILL HERE2");
      const {name,description,price,imageUrl,sizes,stockQuantity,trending,featured,item_id,expandedCategory} = result.data;
      const x = await db.select({id: categories.id})
                    .from(categories)
                    .where(eq(categories.name,expandedCategory));
      const categoryId = x[0].id;
      // console.log("WHAT IS catId", categoryId);
      const productData = {
        name,
        description,
        price,
        imageUrl,
        categoryId,
        sizes,
        stockQuantity,
        trending,
        featured,
        item_id
      };
      // console.log("PRODUCT DATA", productData);
      const newProduct = await storage.addProduct(productData);
      return res.status(200).json({
        success: true,
        message: "Product added successfully",
        product: newProduct,
      });

    } catch (error) {
      console.error('Error in adding product:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding product'
      });
    }
});

  // Waitlist
  app.post("/api/waitlist", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWaitlistSchema.parse(req.body);
      const waitlistEntry = await storage.addToWaitlist(validatedData);
      res.status(201).json(waitlistEntry);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      // Check for duplicate email error
      if (error.message.includes("already on our waitlist")) {
        return res.status(409).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message });
    }
  });

  // Contact
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.submitContactMessage(validatedData);
      res.status(201).json(contactMessage);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


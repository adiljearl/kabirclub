var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  UserRole: () => UserRole,
  cart_items: () => cart_items,
  categories: () => categories,
  contactMessages: () => contactMessages,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertProductSchema: () => insertProductSchema,
  insertUserSchema: () => insertUserSchema,
  insertWaitlistSchema: () => insertWaitlistSchema,
  loginUserSchema: () => loginUserSchema,
  products: () => products,
  users: () => users,
  waitlist: () => waitlist
});
import { pgTable, text, serial, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique()
  // imageUrl: text("image_url").notNull(),
});
var insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true
  // imageUrl: true,
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  item_id: text("item_id"),
  featured: boolean("featured").default(false),
  trending: boolean("trending").default(false),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  sizes: jsonb("sizes").default([]),
  // colors: jsonb("colors").default([]),
  stockQuantity: integer("stock_quantity").default(0)
});
var insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  item_id: true,
  imageUrl: true,
  // categoryId: true,
  sizes: true,
  stockQuantity: true,
  featured: true,
  trending: true
}).extend({
  price: z.preprocess(
    (val) => typeof val === "string" ? Number(val) : val,
    z.number()
  ),
  // categoryId: z.preprocess(
  //   (val) => (typeof val === 'string' ? Number(val) : val),
  //   z.number()
  // ),
  stockQuantity: z.preprocess(
    (val) => typeof val === "string" ? Number(val) : val,
    z.number()
  ),
  featured: z.preprocess(
    (val) => typeof val === "string" ? val === "true" : val,
    z.boolean()
  ),
  trending: z.preprocess(
    (val) => typeof val === "string" ? val === "true" : val,
    z.boolean()
  )
}).passthrough();
var cart_items = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id"),
  quantity: integer("quantity").notNull().default(1),
  user_id: integer("user_id").notNull(),
  size: text("size").notNull()
});
var insertCartItemSchema = createInsertSchema(cart_items).pick({
  id: true,
  quantity: true,
  product_id: true,
  user_id: true
});
var waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertWaitlistSchema = createInsertSchema(waitlist).pick({
  name: true,
  email: true
});
var contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true
});
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["CUSTOMER"] = "customer";
  UserRole2["ADMIN"] = "admin";
  return UserRole2;
})(UserRole || {});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer" /* CUSTOMER */),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({ passwordHash: true, id: true, createdAt: true }).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
var loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});

// db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();
var { Pool } = pkg;
var pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment.");
}
var sql = postgres(connectionString);
var db = drizzle(sql, { schema: schema_exports });

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
var MemoryStore = createMemoryStore(session);
function configureAuth(app2) {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "adilclub-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1e3 * 60 * 60 * 24
        // 1 day
        // secure: process.env.NODE_ENV === 'production' 
      },
      store: new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      })
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await getUserByEmailDB(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          return done(null, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: (users3, { eq: eq3 }) => eq3(users3.id, id)
      });
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.format()
        });
      }
      const { email, name, password } = result.data;
      const existingUser = await getUserByEmailDB(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const userData = {
        email,
        name,
        password,
        // These will be ignored by our implementation
        confirmPassword: password,
        // but are required by the TypeScript interface
        passwordHash,
        role: "customer" /* CUSTOMER */
      };
      const newUser = await storage.createUser(userData);
      req.login({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error logging in after registration"
          });
        }
        return res.status(201).json({
          success: true,
          message: "Registration successful",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating user"
      });
    }
  });
  app2.post("/api/auth/login", (req, res, next) => {
    try {
      const result = loginUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.format()
        });
      }
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({
            success: false,
            message: info.message || "Authentication failed"
          });
        }
        req.login(user, (err2) => {
          if (err2) {
            return next(err2);
          }
          return res.json({
            success: true,
            message: "Login successful",
            user
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging in"
      });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error logging out"
        });
      }
      res.json({
        success: true,
        message: "Logout successful"
      });
    });
  });
  app2.get("/api/auth/current-user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    res.json({
      success: true,
      user: req.user
    });
  });
  app2.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    const user = req.user;
    if (!req.user || req.user.role !== "admin" /* ADMIN */) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }
    next();
  });
}
async function getUserByEmailDB(email) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (result.length > 0) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}

// server/storage.ts
var MemStorage = class {
  categories;
  products;
  cartItems;
  waitlist;
  contactMessages;
  users;
  categoryId;
  // private productId: number;
  cartItemId;
  waitlistId;
  contactMessageId;
  userId;
  constructor() {
    this.categories = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.cartItems = /* @__PURE__ */ new Map();
    this.waitlist = /* @__PURE__ */ new Map();
    this.contactMessages = /* @__PURE__ */ new Map();
    this.users = /* @__PURE__ */ new Map();
    this.categoryId = 1;
    this.cartItemId = 1;
    this.waitlistId = 1;
    this.contactMessageId = 1;
    this.userId = 1;
    this.initializeData();
  }
  initializeData() {
    const categories2 = [
      { name: "Summer Articles", slug: "summer-articles", imageUrl: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Winter Articles", slug: "winter-articles", imageUrl: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Party Wear", slug: "party-wear", imageUrl: "https://images.pexels.com/photos/27313021/pexels-photo-27313021/free-photo-of-a-man-and-woman-posing-for-a-photo-in-front-of-a-chair.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Bottom Wear", slug: "bottom-wear", imageUrl: "https://images.pexels.com/photos/3914693/pexels-photo-3914693.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Track Suits", slug: "track-suits", imageUrl: "https://images.pexels.com/photos/18600731/pexels-photo-18600731/free-photo-of-attractive-woman-sitting-in-the-studio.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Accessories", slug: "accessories", imageUrl: "https://images.pexels.com/photos/31323080/pexels-photo-31323080/free-photo-of-elegant-leather-belts-displayed-on-gray-surface.jpeg" }
    ];
    categories2.forEach((cat) => {
      this.categories.set(this.categoryId, {
        ...cat,
        id: this.categoryId++
      });
    });
  }
  // Categories
  async getCategories() {
    return Array.from(this.categories.values());
  }
  async getCategoryBySlug(slug) {
    return Array.from(this.categories.values()).find((c) => c.slug === slug);
  }
  // Products
  async getProducts() {
    return Array.from(this.products.values());
  }
  async getProductById(id) {
    return this.products.get(id);
  }
  async getProductsByCategory(categoryId) {
    return Array.from(this.products.values()).filter((p) => p.categoryId === categoryId);
  }
  async getFeaturedProducts() {
    return Array.from(this.products.values()).filter((p) => p.isFeatured);
  }
  async getTrendingProducts() {
    return Array.from(this.products.values()).filter((p) => p.isTrending);
  }
  // Cart
  async getCartItems(sessionId) {
    const items = Array.from(this.cartItems.values()).filter((c) => c.sessionId === sessionId);
    return items.map((item) => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found for cart item: ${item.id}`);
      return { ...item, product };
    });
  }
  async getCartItem(id) {
    return this.cartItems.get(id);
  }
  async addCartItem(item) {
    const existingItems = Array.from(this.cartItems.values()).filter(
      (c) => c.sessionId === item.sessionId && c.productId === item.productId
    );
    if (existingItems.length > 0) {
      const existingItem = existingItems[0];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + (item.quantity || 1)
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    const newItem = {
      ...item,
      id: this.cartItemId++,
      quantity: item.quantity || 1,
      // Ensure quantity has a default value
      createdAt: /* @__PURE__ */ new Date()
    };
    this.cartItems.set(newItem.id, newItem);
    return newItem;
  }
  async updateCartItem(id, quantity) {
    const item = this.cartItems.get(id);
    if (!item) throw new Error(`Cart item not found: ${id}`);
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  async removeCartItem(id) {
    this.cartItems.delete(id);
  }
  // Waitlist
  async addToWaitlist(entry) {
    const existingEntry = Array.from(this.waitlist.values()).find(
      (w) => w.email.toLowerCase() === entry.email.toLowerCase()
    );
    if (existingEntry) {
      throw new Error("This email is already on our waitlist");
    }
    const newEntry = {
      ...entry,
      id: this.waitlistId++,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.waitlist.set(newEntry.id, newEntry);
    return newEntry;
  }
  // Contact
  async submitContactMessage(message) {
    const newMessage = {
      ...message,
      id: this.contactMessageId++,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contactMessages.set(newMessage.id, newMessage);
    return newMessage;
  }
  // Product Management (for admin)
  async addProduct(product) {
    const newProduct = {
      ...product,
      id: this.productId++,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      sizes: product.sizes || [],
      stockQuantity: product.stockQuantity || 0,
      featured: product.featured || false,
      trending: product.trending || false,
      item_id: product.item_id
    };
    this.products.set(newProduct.id, newProduct);
    const result = await db.insert(products).values({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      sizes: product.sizes || [],
      stockQuantity: product.stockQuantity || 0,
      featured: product.featured || false,
      trending: product.trending || false,
      item_id: product.item_id
    });
    return newProduct;
  }
  async updateProduct(id, product) {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error(`Product not found: ${id}`);
    }
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  async deleteProduct(id) {
    if (!this.products.has(id)) {
      throw new Error(`Product not found: ${id}`);
    }
    this.products.delete(id);
  }
  // User Management
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  async getUserById(id) {
    return this.users.get(id);
  }
  async createUser(user) {
    const existingUser = await getUserByEmailDB(user.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }
    const newUser = {
      id: this.userId++,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role || "customer" /* CUSTOMER */,
      // Default to customer if role not specified
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(newUser.id, newUser);
    const result = await db.insert(users).values({
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role || "customer" /* CUSTOMER */
    });
    return newUser;
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
};
var storage = new MemStorage();

// server/routes.ts
import { eq as eq2 } from "drizzle-orm";
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/categories", async (_req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const pageNumber = req.query.page;
      const limitNumber = req.query.limit;
      const { slug } = req.params;
      const category = await db.select().from(categories).where(eq2(categories.slug, slug));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/products", async (req, res) => {
    const categoryFromDB = await db.select({ category: categories.id }).from(categories).where(eq2(categories.name, req.query.category));
    try {
      const { rows } = await pool.query(
        "SELECT * FROM products WHERE category_id = $1",
        [categoryFromDB[0]?.category]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM products WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const { name, categoryId, price, stockQuantity, description, imageUrl, sizes, featured, trending, item_id } = req.body;
    const catID = await db.select({ id: categories.id }).from(categories).where(eq2(req.body.expandedCategory, categories.name));
    console.log("WHAT IS CATIDDDDD", catID[0].id);
    try {
      const booleanFeature = featured === true || featured === "true";
      const booleanTrending = trending === true || trending === "true";
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
          JSON.stringify(sizes),
          // Ensuring sizes are stored as JSON
          booleanFeature,
          // Correct boolean value passed
          booleanTrending,
          item_id,
          id
        ]
      );
      console.log("Updated Row:", rows[0]);
      res.json(rows[0]);
    } catch (error) {
      console.error("Error updating product:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/products/featured", async (_req, res) => {
    try {
      const x = await db.select().from(products).where(eq2(products.featured, true));
      res.json(x);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/products/trending", async (_req, res) => {
    try {
      const x = await db.select().from(products).where(eq2(products.trending, true));
      res.json(x);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await db.select().from(products).where(eq2(products.id, id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const category = await storage.getCategoryBySlug(
        (await storage.getCategories()).find((c) => c.id === product.categoryId)?.slug || ""
      );
      res.json({
        ...product,
        category: category || null
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/products/category/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await db.select().from(categories).where(eq2(categories.slug, slug));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const categoryID = await db.select({ id: categories.id }).from(categories).where(eq2(categories.slug, slug));
      const productsByCategory = await db.select().from(products).where(eq2(products.categoryId, categoryID[0].id));
      res.json(productsByCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/product/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { rows } = await pool.query(
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
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          message: "Not Authenticated"
        });
      }
      const userid = req.user.id;
      const { rows } = await pool.query(
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
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          message: "Not Authenticated"
        });
      }
      const userid = req.user.id;
      const result = insertCartItemSchema.safeParse(req.body);
      const { product_id, quantity, size } = req.body;
      const addedItem = await db.insert(cart_items).values({
        product_id,
        quantity,
        size,
        user_id: req.user.id
      });
      res.status(201).json(addedItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/cart/:id", async (req, res) => {
    const { id, quantity } = req.body;
    try {
      const { rows } = await pool.query(
        `UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING *;`,
        [quantity, id]
      );
      res.status(201).json({ message: "Quantity of your item updated successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.body;
      const res2 = await pool.query(
        `DElETE
        FROM cart_items
        WHERE id = $1`,
        [id]
      );
      res2.status(201).json({ message: "Item has been removed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/cart/", async (req, res) => {
    try {
      const id = req.user.id;
      console.log("CURRENT user is", id);
      const response = await pool.query(
        `DELETE
        FROM cart_items
        WHERE user_id = $1`,
        [id]
      );
      response.status(201).json({ message: "Cleared your cart" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      console.log("REQ IN BODY", req.body);
      console.log("REQ PARAMS", req.params);
      const result = insertProductSchema.safeParse(req.body);
      console.log("WORKING UP UNTILL HERE1");
      if (!result.success) {
        console.error("Validation Errors:", JSON.stringify(result.error.format(), null, 2));
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: result.error.format()
        });
      }
      console.log("WORKING UP UNTILL HERE2");
      const { name, description, price, imageUrl, sizes, stockQuantity, trending, featured, item_id, expandedCategory } = result.data;
      const x = await db.select({ id: categories.id }).from(categories).where(eq2(categories.name, expandedCategory));
      const categoryId = x[0].id;
      console.log("WHAT IS catId", categoryId);
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
      const newProduct = await storage.addProduct(productData);
      return res.status(200).json({
        success: true,
        message: "Product added successfully",
        product: newProduct
      });
    } catch (error) {
      console.error("Error in adding product:", error);
      res.status(500).json({
        success: false,
        message: "Error adding product"
      });
    }
  });
  app2.post("/api/waitlist", async (req, res) => {
    try {
      const validatedData = insertWaitlistSchema.parse(req.body);
      const waitlistEntry = await storage.addToWaitlist(validatedData);
      res.status(201).json(waitlistEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      if (error.message.includes("already on our waitlist")) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.submitContactMessage(validatedData);
      res.status(201).json(contactMessage);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
configureAuth(app);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 4500;
  server.listen({
    port,
    // host: "0.0.0.0",
    reusePort: true
  }, () => {
    console.log("Connected to DB:", process.env.DATABASE_URL);
    log(`serving on port ${port}`);
  });
})();

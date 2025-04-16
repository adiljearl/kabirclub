import { 
  Category, InsertCategory, 
  Product, InsertProduct, 
  CartItem, InsertCartItem,
  Waitlist, InsertWaitlist,
  ContactMessage, InsertContactMessage,
  User, InsertUser, UserRole
} from "@shared/schema";
import { products } from "@shared/schema";
import {db} from '../db';
import {users} from '../shared/schema';
import { getUserByEmailDB } from "./auth";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getTrendingProducts(): Promise<Product[]>;
  addProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeCartItem(id: number): Promise<void>;
  
  // Waitlist
  addToWaitlist(entry: InsertWaitlist): Promise<Waitlist>;
  
  // Contact
  submitContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Users
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private waitlist: Map<number, Waitlist>;
  private contactMessages: Map<number, ContactMessage>;
  private users: Map<number, User>;
  
  private categoryId: number;
  // private productId: number;
  private cartItemId: number;
  private waitlistId: number;
  private contactMessageId: number;
  private userId: number;
  
  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.waitlist = new Map();
    this.contactMessages = new Map();
    this.users = new Map();
    
    this.categoryId = 1;
    // this.productId = 1;
    this.cartItemId = 1;
    this.waitlistId = 1;
    this.contactMessageId = 1;
    this.userId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Categories
    const categories = [
      { name: "Summer Articles", slug: "summer-articles", imageUrl: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Winter Articles", slug: "winter-articles", imageUrl: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Party Wear", slug: "party-wear", imageUrl: "https://images.pexels.com/photos/27313021/pexels-photo-27313021/free-photo-of-a-man-and-woman-posing-for-a-photo-in-front-of-a-chair.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Bottom Wear", slug: "bottom-wear", imageUrl: "https://images.pexels.com/photos/3914693/pexels-photo-3914693.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Track Suits", slug: "track-suits", imageUrl: "https://images.pexels.com/photos/18600731/pexels-photo-18600731/free-photo-of-attractive-woman-sitting-in-the-studio.jpeg?auto=compress&cs=tinysrgb&w=1600" },
      { name: "Accessories", slug: "accessories", imageUrl: "https://images.pexels.com/photos/31323080/pexels-photo-31323080/free-photo-of-elegant-leather-belts-displayed-on-gray-surface.jpeg" },
    ];
    
    categories.forEach(cat => {
      this.categories.set(this.categoryId, { 
        ...cat, 
        id: this.categoryId++ 
      });
    });
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }
  
  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.categoryId === categoryId);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isFeatured);
  }
  
  async getTrendingProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isTrending);
  }
  
  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(c => c.sessionId === sessionId);
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found for cart item: ${item.id}`);
      return { ...item, product };
    });
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const existingItems = Array.from(this.cartItems.values()).filter(
      c => c.sessionId === item.sessionId && c.productId === item.productId
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
    
    const newItem: CartItem = { 
      ...item, 
      id: this.cartItemId++, 
      quantity: item.quantity || 1, // Ensure quantity has a default value
      createdAt: new Date() 
    };
    this.cartItems.set(newItem.id, newItem);
    return newItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const item = this.cartItems.get(id);
    if (!item) throw new Error(`Cart item not found: ${id}`);
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }
  
  // Waitlist
  async addToWaitlist(entry: InsertWaitlist): Promise<Waitlist> {
    const existingEntry = Array.from(this.waitlist.values()).find(
      w => w.email.toLowerCase() === entry.email.toLowerCase()
    );
    
    if (existingEntry) {
      throw new Error("This email is already on our waitlist");
    }
    
    const newEntry = { 
      ...entry, 
      id: this.waitlistId++, 
      createdAt: new Date() 
    };
    this.waitlist.set(newEntry.id, newEntry);
    return newEntry;
  }
  
  // Contact
  async submitContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const newMessage = { 
      ...message, 
      id: this.contactMessageId++, 
      createdAt: new Date() 
    };
    this.contactMessages.set(newMessage.id, newMessage);
    return newMessage;
  }
  
  // Product Management (for admin)
  async addProduct(product: InsertProduct): Promise<Product> {
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
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error(`Product not found: ${id}`);
    }
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<void> {
    if (!this.products.has(id)) {
      throw new Error(`Product not found: ${id}`);
    }
    
    this.products.delete(id);
  }
  
  // User Management
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    const existingUser = await getUserByEmailDB(user.email);
    // const existingUser = await this.getUserByEmail(user.email);
    
    if (existingUser) {
      throw new Error("Email already registered");
    }
    
    // Create the user with required fields and proper typing
    const newUser: User = {
      id: this.userId++,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role || UserRole.CUSTOMER, // Default to customer if role not specified
      createdAt: new Date()
    };
    
    this.users.set(newUser.id, newUser);
    const result = await db.insert(users).values({
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role || UserRole.CUSTOMER,
    });
    return newUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();

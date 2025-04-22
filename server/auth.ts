import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { insertUserSchema, loginUserSchema, UserRole, User } from '@shared/schema';
import { createId } from '@paralleldrive/cuid2';
import {db} from '../db';
import {users} from '../shared/schema';
import {eq} from "drizzle-orm";
import { Navigate } from 'react-router-dom';


// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

// Configure passport to use local strategy
export function configureAuth(app: Express) {
  // Initialize session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'adilclub-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        // secure: process.env.NODE_ENV === 'production' 
      },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          // Check user in DB
          // const user = await db.query.users.findFirst({
          //   where: (users, { eq }) => eq(users.email, email),
          // });
          const user = await getUserByEmailDB(email);
  
          if (!user) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
  
          // Compare password
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: 'Incorrect email or password' });
          }
  
          // Return user without sensitive data
          return done(null, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });


  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Fetch user from DB using the ID
      // const user = await db.query.users.findFirst({
      //   where: { id: id },
      // });
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id),
      });
      
  
      if (!user) {
        return done(null, false);
      }
  
      // Return user without sensitive data
      done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      done(error);
    }
  });

  // Register authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.error.format()
        });
      }

      const { email, name, password } = result.data;

      // Check if user already exists
      // const existingUser = await storage.getUserByEmail(email);
      const existingUser = await getUserByEmailDB(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user with required properties for storage interface
      const userData = {
        email,
        name,
        password,         // These will be ignored by our implementation
        confirmPassword: password, // but are required by the TypeScript interface
        passwordHash,
        role: UserRole.CUSTOMER
      };
      
      const newUser = await storage.createUser(userData);

      // Log in the user
      req.login({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error logging in after registration'
          });
        }
        
        return res.status(201).json({
          success: true,
          message: 'Registration successful',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating user'
      });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = loginUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: result.error.format()
        });
      }

      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: info.message || 'Authentication failed'
          });
        }

        req.login(user, (err) => {
          if (err) {
            return next(err);
          }

          return res.json({
            success: true,
            message: 'Login successful',
            user
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in'
      });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging out'
        });
      }
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    });
  });

  app.get('/api/auth/current-user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      user: req.user
    });
  });

  // Middleware to check if user is admin
  app.use('/api/admin/*', (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const user = req.user as any;
    if (!req.user || (req.user as any).role !== UserRole.ADMIN){
      return res.status(404).json({
        success: false,
        message: 'Not authorized',
      })
    }
    
    next();
  });
}
// res.status(404).json({ message: "Product not found" });
//check if user is present in "users" table
export async function getUserByEmailDB(email: string) {
  try {
    // Query the database to get user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Return the user if found
    if (result.length > 0) {
      return result[0];
    }
    
    // Return null if no user found
    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    if (user.role === UserRole.ADMIN) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
}

// Helper function to create a default admin user if none exists
// export async function createDefaultAdminIfNeeded() {
//   try {
//     // Check if any users exist
//     const users = await storage.getAllUsers();
    
//     if (users.length === 0) {
//       // Generate a random password for the default admin
//       const defaultPassword = createId();
//       const salt = await bcrypt.genSalt(10);
//       const passwordHash = await bcrypt.hash(defaultPassword, salt);
      
//       // Create default admin user
//       await storage.createUser({
//         email: 'admin@adilclub.com',
//         name: 'Admin',
//         password: defaultPassword, // Required by TypeScript interface
//         confirmPassword: defaultPassword, // Required by TypeScript interface
//         passwordHash,
//         role: UserRole.ADMIN
//       });
      
//       console.log('Default admin created:');
//       console.log('Email: admin@adilclub.com');
//       console.log('Password:', defaultPassword);
//       console.log('Please change this password after first login.');
//     }
//   } catch (error) {
//     console.error('Error creating default admin:', error);
//   }
// }
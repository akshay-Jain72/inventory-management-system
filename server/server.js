const Product = require("./models/Product");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Purchase = require("./models/Purchase");
const Sale = require("./models/Sale");
const Supplier = require("./models/Supplier");
require("dotenv").config();
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();

app.use(cors());
app.use(express.json());


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error));



// Create product

// Create product
app.post(
  "/products",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      const { name, sku, price, quantity, category } = req.body;

    // Check required fields
if (
  !name ||
  !sku ||
  price === undefined ||
  quantity === undefined ||
  !category
) {
  return res.status(400).json({
    message: "All product fields are required"
  });
}

// Check valid price and quantity
if (price < 0 || quantity < 0) {
  return res.status(400).json({
    message: "Price and quantity cannot be negative"
  });
}

      // Create product
      const product = await Product.create({
        name,
        sku,
        price,
        quantity,
        category
      });

      res.status(201).json({
        message: "Product created successfully",
        product
      });

    } catch (error) {
      console.log("Create Product Error:", error);

      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Get all products
app.get(
  "/products",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
    try {
      const products = await Product.find();

      res.json(products);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Get single product
app.get(
  "/products/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json(product);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
// Update product
app.put(
  "/products/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message: "Product updated successfully",
        product: product
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Delete product
app.delete(
  "/products/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json({
        message: "Product deleted successfully",
        product: product
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);


// Create purchase 
app.post(
  "/purchases",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => { 
  try { 
    const { 
      productId, 
      supplierId, 
      quantity, 
      purchasePrice 
    } = req.body; 
 
    // Product find karo 
    const product = await Product.findById(productId); 
 
    if (!product) { 
      return res.status(404).json({ 
        message: "Product not found" 
      }); 
    }

    // Supplier find karo
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found"
      });
    }

    // Total amount calculate karo
    const totalAmount = quantity * purchasePrice;

    // Purchase save karo
    const purchase = await Purchase.create({
      product: productId,
      supplier: supplierId,
      quantity: quantity,
      purchasePrice: purchasePrice,
      totalAmount: totalAmount
    });

    // Product stock increase karo
    product.quantity += quantity;

    // Product save karo
    await product.save();

    res.status(201).json({
      message: "Purchase created successfully",
      purchase: purchase,
      updatedStock: product.quantity
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});// Get all purchases 
app.get(
  "/purchases",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try { 
    const purchases = await Purchase.find() 
      .populate("product", "name category price") 
      .populate("supplier", "companyName contactPerson phone email") 
      .sort({ createdAt: -1 }); 

    res.json(purchases); 

  } catch (error) { 
    res.status(500).json({ 
      message: error.message 
    }); 
  } 
});

// Update purchase
app.put(
  "/purchases/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      const { quantity, purchasePrice, supplierId } = req.body;

      // Purchase find karo
      const purchase = await Purchase.findById(req.params.id);

      if (!purchase) {
        return res.status(404).json({
          message: "Purchase not found"
        });
      }

    // Product find karo
    const product = await Product.findById(purchase.product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Old quantity
    const oldQuantity = purchase.quantity;

    // New quantity
    const newQuantity = quantity;

    // Difference calculate karo
    const difference = newQuantity - oldQuantity;

    // Agar stock kam karna hai
    if (difference < 0) {
      const stockToRemove = Math.abs(difference);

      if (product.quantity < stockToRemove) {
        return res.status(400).json({
          message: "Cannot update purchase because stock is already used",
          currentStock: product.quantity,
          requiredStock: stockToRemove
        });
      }
    }

    // Supplier change hua hai to check karo
    if (supplierId) {
      const supplier = await Supplier.findById(supplierId);

      if (!supplier) {
        return res.status(404).json({
          message: "Supplier not found"
        });
      }

      purchase.supplier = supplierId;
    }

    // Purchase update
    purchase.quantity = newQuantity;
    purchase.purchasePrice = purchasePrice;

    // Total amount recalculate
    purchase.totalAmount = newQuantity * purchasePrice;

    // Stock update
    product.quantity += difference;

    // Save dono
    await purchase.save();
    await product.save();

    res.json({
      message: "Purchase updated successfully",
      purchase: purchase,
      updatedStock: product.quantity
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
// Delete purchase
app.delete(
  "/purchases/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      // Purchase find karo
      const purchase = await Purchase.findById(req.params.id);

      if (!purchase) {
        return res.status(404).json({
          message: "Purchase not found"
        });
      }

      // Product find karo
      const product = await Product.findById(purchase.product);

      if (product) {

        // Check karo ki stock enough hai
        if (product.quantity < purchase.quantity) {
          return res.status(400).json({
            message: "Cannot delete purchase because stock is already used",
            currentStock: product.quantity,
            purchaseQuantity: purchase.quantity
          });
        }

        // Purchase ki quantity stock se minus karo
        product.quantity -= purchase.quantity;

        // Product save karo
        await product.save();
      }

      // Purchase delete karo
      await Purchase.findByIdAndDelete(req.params.id);

      res.json({
        message: "Purchase deleted successfully",
        purchase: purchase,
        updatedStock: product ? product.quantity : null
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Create sale
app.post(
  "/sales",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
    try {
      const { productId, quantity, sellingPrice } = req.body;

      // Product find karo
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // Stock check karo
      if (product.quantity < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
          availableStock: product.quantity
        });
      }

      // Latest purchase price find karo
      const purchase = await Purchase.findOne({
        product: productId
      }).sort({ createdAt: -1 });

      if (!purchase) {
        return res.status(400).json({
          message: "Purchase record not found for this product"
        });
      }
    // Purchase price
    const purchasePrice = purchase.purchasePrice;

    // Total sale amount
    const totalAmount = quantity * sellingPrice;

    // Profit calculate
    const profit = (sellingPrice - purchasePrice) * quantity;

    // Sale save karo
    const sale = await Sale.create({
      product: productId,
      quantity: quantity,
      sellingPrice: sellingPrice,
      purchasePrice: purchasePrice,
      totalAmount: totalAmount,
      profit: profit
    });

    // Stock decrease karo
    product.quantity -= quantity;

    // Product save karo
    await product.save();

    res.status(201).json({
      message: "Sale created successfully",
      sale: sale,
      updatedStock: product.quantity
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
// Get all sales
app.get(
  "/sales",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
    try {
      const sales = await Sale.find()
        .populate("product", "name category price")
        .sort({ createdAt: -1 });

      res.json(sales);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
// Update sale
app.put(
  "/sales/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      const { quantity, sellingPrice } = req.body;

      // Sale find karo
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
        return res.status(404).json({
          message: "Sale not found"
        });
      }

      // Product find karo
      const product = await Product.findById(sale.product);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // Old quantity
      const oldQuantity = sale.quantity;

      // New quantity
      const newQuantity = quantity;

      // Difference
      const difference = newQuantity - oldQuantity;

      // Agar sale quantity badh rahi hai
      if (difference > 0) {
        if (product.quantity < difference) {
          return res.status(400).json({
            message: "Insufficient stock",
            availableStock: product.quantity,
            requiredStock: difference
          });
        }

        product.quantity -= difference;
      }

      // Agar sale quantity kam ho rahi hai
      if (difference < 0) {
        product.quantity += Math.abs(difference);
      }

      // Sale update
      sale.quantity = newQuantity;
      sale.sellingPrice = sellingPrice;

      // Total amount recalculate
      sale.totalAmount = newQuantity * sellingPrice;

      // Profit recalculate
      sale.profit =
        (sellingPrice - sale.purchasePrice) * newQuantity;

      // Save
      await sale.save();
      await product.save();

      res.json({
        message: "Sale updated successfully",
        sale: sale,
        updatedStock: product.quantity
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
// Delete sale
app.delete(
  "/sales/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      // Sale find karo
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
        return res.status(404).json({
          message: "Sale not found"
        });
      }

      // Product find karo
      const product = await Product.findById(sale.product);

      if (product) {
        // Sale ki quantity stock me wapas add karo
        product.quantity += sale.quantity;

        // Product save karo
        await product.save();
      }

      // Sale delete karo
      await Sale.findByIdAndDelete(req.params.id);

      res.json({
        message: "Sale deleted successfully",
        sale: sale,
        updatedStock: product ? product.quantity : null
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);
// Create supplier
app.post(
  "/suppliers",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      message: "Supplier created successfully",
      supplier: supplier
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get all suppliers
app.get(
  "/suppliers",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    const suppliers = await Supplier.find();

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get single supplier
app.get(
  "/suppliers/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found"
      });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Update supplier
app.put(
  "/suppliers/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found"
      });
    }

    res.json({
      message: "Supplier updated successfully",
      supplier: supplier
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Delete supplier
app.delete(
  "/suppliers/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found"
      });
    }

    res.json({
      message: "Supplier deleted successfully",
      supplier: supplier
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Complete Dashboard
app.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total categories
    const categories = await Product.distinct("category");
    const totalCategories = categories.length;

    // Low stock
    const lowStockProducts = await Product.find({
      quantity: { $lte: 5 }
    });

    // Inventory value
    const products = await Product.find();

    const inventoryValue = products.reduce((total, product) => {
      return total + (product.quantity * product.price);
    }, 0);

    // Today's sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await Sale.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const todayRevenue = todaySales.reduce((total, sale) => {
      return total + sale.totalAmount;
    }, 0);

    // Monthly revenue
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const monthlySales = await Sale.find({
      createdAt: {
        $gte: startOfMonth,
        $lt: endOfMonth
      }
    });

    const monthlyRevenue = monthlySales.reduce((total, sale) => {
      return total + sale.totalAmount;
    }, 0);

    // Total sales
    const totalSales = await Sale.countDocuments();

    res.json({
      totalProducts,
      totalCategories,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      inventoryValue,
      totalSales,
      todaySalesCount: todaySales.length,
      todayRevenue,
      monthlyOrders: monthlySales.length,
      monthlyRevenue
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get low stock products
app.get(
  "/low-stock",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
    try {
      const products = await Product.find({
        quantity: { $lte: 5 }
      });

      res.json({
        count: products.length,
        products: products
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Today's sales
app.get(
  "/today-sales",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate("product", "name category price");

    const totalSales = sales.reduce((total, sale) => {
      return total + sale.totalAmount;
    }, 0);

    res.json({
      count: sales.length,
      totalSales: totalSales,
      sales: sales
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Monthly revenue
app.get(
  "/monthly-revenue",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    const now = new Date();

    // Current month ka first day
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Current month ka last day
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const sales = await Sale.find({
      createdAt: {
        $gte: startOfMonth,
        $lt: endOfMonth
      }
    }).populate("product", "name category price");

    const totalRevenue = sales.reduce((total, sale) => {
      return total + sale.totalAmount;
    }, 0);

    res.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalOrders: sales.length,
      totalRevenue: totalRevenue,
      sales: sales
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Best selling products
app.get(
  "/best-selling",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    const bestSelling = await Sale.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantity: {
            $sum: "$quantity"
          },
          totalRevenue: {
            $sum: "$totalAmount"
          }
        }
      },

      {
        $sort: {
          totalQuantity: -1
        }
      },

      {
        $limit: 5
      }
    ]);

    // Product details add karo
    const products = await Product.find();

    const result = bestSelling.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item._id.toString()
      );

      return {
        product: product
          ? {
              id: product._id,
              name: product.name,
              category: product.category,
              price: product.price
            }
          : null,

        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue
      };
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Profit Report
app.get(
  "/profit",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  async (req, res) => {
  try {
    const sales = await Sale.find().populate("product");

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const profitDetails = sales.map((sale) => {
      const revenue = sale.totalAmount;
      const cost = sale.purchasePrice * sale.quantity;
      const profit = sale.profit;

      totalRevenue += revenue;
      totalCost += cost;
      totalProfit += profit;

      return {
        saleId: sale._id,
        product: sale.product
          ? sale.product.name
          : "Unknown",
        quantity: sale.quantity,
        sellingPrice: sale.sellingPrice,
        purchasePrice: sale.purchasePrice,
        revenue: revenue,
        cost: cost,
        profit: profit
      };
    });

    res.json({
      totalRevenue,
      totalCost,
      totalProfit,
      profitDetails
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Register User
a
  // Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER REQUEST:", {
      name,
      email,
    });

    // Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
    });

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET is missing!");

      return res.status(500).json({
        message: "JWT_SECRET is not configured on server",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    console.log("TOKEN CREATED:", !!token);

    // Response
    return res.status(201).json({
      message: "Registration successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("Register Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// Login User

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured on server",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("Login Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

    // Create JWT token
// Protected route - Test JWT
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Authentication successful",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Admin only test route
app.get(
  "/api/admin-test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({
      message: "Admin access successful"
    });
  }
);


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
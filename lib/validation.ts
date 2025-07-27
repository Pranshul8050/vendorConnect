import { z } from "zod"

// User validation schemas
export const phoneSchema = z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format")

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers")

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name too long")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location too long")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Address too long").optional().or(z.literal("")),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number")
    .optional()
    .or(z.literal("")),
})

export const bankDetailsSchema = z.object({
  accountNumber: z.string().min(9, "Account number must be at least 9 digits").max(18, "Account number too long"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  bankName: z.string().min(2, "Bank name required").max(100, "Bank name too long"),
  accountHolderName: z.string().min(2, "Account holder name required").max(100, "Name too long"),
})

// Group validation schemas
export const groupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(100, "Group name too long"),
  location: z.string().min(2, "Location required").max(100, "Location too long"),
  category: z.enum(["vegetables", "spices", "oil", "grains", "dairy", "mixed"]),
  description: z.string().max(500, "Description too long").optional(),
  maxMembers: z.number().min(2, "Minimum 2 members").max(50, "Maximum 50 members").default(10),
})

// Order validation schemas
export const orderItemSchema = z.object({
  name: z.string().min(1, "Item name required").max(100, "Item name too long"),
  quantity: z.number().min(0.1, "Quantity must be positive").max(10000, "Quantity too large"),
  unit: z.enum(["kg", "g", "l", "ml", "pieces", "packets"]),
  estimatedPrice: z.number().min(0, "Price cannot be negative").max(100000, "Price too high"),
  category: z.string().min(1, "Category required"),
})

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  deliveryDate: z.date().min(new Date(), "Delivery date must be in the future"),
  deliveryLocation: z.string().min(5, "Delivery location required").max(200, "Location too long"),
  notes: z.string().max(500, "Notes too long").optional(),
})

// Surplus validation schemas
export const surplusItemSchema = z.object({
  name: z.string().min(1, "Item name required").max(100, "Item name too long"),
  quantity: z.number().min(0.1, "Quantity must be positive").max(1000, "Quantity too large"),
  unit: z.enum(["kg", "g", "l", "ml", "pieces", "packets"]),
  expiryDate: z.date().min(new Date(), "Expiry date must be in the future"),
  price: z.number().min(0, "Price cannot be negative").max(10000, "Price too high"),
  location: z.string().min(5, "Location required").max(200, "Location too long"),
  description: z.string().max(300, "Description too long").optional(),
})

// Validation helper functions\
export const validateInput =
  <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {\
  try {\
    const result = schema.parse(data);\
    return { success: true, data: result };
  } catch (error) {\
    if (error instanceof z.ZodError) {\
      const errors = error.errors.map(err => err.message);\
      return { success: false, errors };
    }\
    return { success: false, errors: ["Validation failed"] };
  }
};

export const sanitizeInput = (input: string): string => {\
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .substring(0, 1000); // Limit length
};
\
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {\
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (file.size > maxSize) {\
    return { valid: false, error: "File size must be less than 5MB" };
  }
  
  if (!allowedTypes.includes(file.type)) {\
    return { valid: false, error: "Only JPEG, PNG, WebP images and PDF files are allowed" };
  }
  \
  return { valid: true };\
};

import swaggerAutogen from "swagger-autogen";

const swagger = swaggerAutogen({ openapi: "3.0.0" });

const doc = {
  info: {
    title: "Digital Clinic API",
    version: "1.0.0",
    description: `
## Digital Clinic Backend API

A comprehensive healthcare management system API that provides:

- **Authentication**: User registration, login, OTP verification, JWT-based auth
- **Doctor Management**: Doctor profiles, search, availability
- **Appointments**: Booking, scheduling, status management
- **Payments**: eSewa and Khalti integration
- **Emergency Services**: Real-time emergency requests and responses

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

### Rate Limiting
API endpoints are rate-limited to prevent abuse:
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- OTP verification: 3 requests per 5 minutes
- Payment: 10 requests per hour
- Emergency: 5 requests per 10 minutes
    `,
    contact: {
      name: "Digital Clinic Support",
      email: "support@digitalclinic.com",
    },
    license: {
      name: "ISC",
    },
  },
  host: process.env.HOST
    ? `${process.env.HOST}:${process.env.PORT || 5000}`
    : "localhost:5000",
  basePath: "/",
  schemes: [process.env.NODE_ENV === "production" ? "https" : "http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "User Management",
      description: "Admin user management endpoints",
    },
    {
      name: "Doctors",
      description: "Doctor profile and search endpoints",
    },
    {
      name: "Appointments",
      description: "Appointment booking and management",
    },
    {
      name: "Payments",
      description: "Payment processing with eSewa and Khalti",
    },
    {
      name: "Emergency",
      description: "Emergency request and response system",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter your JWT token",
    },
  },
  definitions: {
    User: {
      user_id: 1,
      full_name: "John Doe",
      email: "john@example.com",
      phone: "+977-9812345678",
      role: "Patient",
      status: "approved",
      created_at: "2024-01-15T10:30:00Z",
    },
    Doctor: {
      doctor_id: 1,
      user_id: 5,
      specialization: "Cardiologist",
      license_number: "DOC-NEP-12345",
      experience_years: 8,
      hospital_name: "Kathmandu Medical College",
      bio: "Experienced heart specialist",
      availability_json: {
        mon: ["10:00", "12:00"],
        tue: ["14:00", "16:00"],
      },
    },
    Appointment: {
      appointment_id: 1,
      patient_id: 3,
      doctor_id: 5,
      appointment_date: "2024-02-10",
      appointment_time: "10:30",
      status: "confirmed",
      payment_status: "pending",
      payment_amount: 500,
    },
    Emergency: {
      emergency_id: 1,
      patient_id: 1,
      emergency_type: "Doctor",
      description: "Severe chest pain",
      latitude: 27.7172,
      longitude: 85.324,
      status: "pending",
      priority: "HIGH",
    },
    SuccessResponse: {
      success: true,
      message: "Operation completed successfully",
      data: {},
    },
    ErrorResponse: {
      success: false,
      message: "Error message",
      errors: [],
    },
    PaginatedResponse: {
      success: true,
      message: "Data retrieved successfully",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 10,
        totalItems: 100,
        itemsPerPage: 10,
        hasNextPage: true,
        hasPrevPage: false,
      },
    },
    LoginRequest: {
      email: "john@example.com",
      password: "SecurePass123",
    },
    RegisterRequest: {
      full_name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123",
      role: "Patient",
      phone: "+977-9812345678",
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token like: Bearer <token>",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          user_id: { type: "integer", example: 1 },
          full_name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          phone: { type: "string", example: "+977-9812345678" },
          role: {
            type: "string",
            enum: ["Patient", "Doctor", "Admin", "Pharmacy"],
          },
          status: { type: "string", enum: ["pending", "approved", "blocked"] },
        },
      },
    },
  },
};

const outputFile = "./swagger-output.json";

// Include all route files for documentation
const endpointsFiles = ["./server.js"];

// Generate swagger documentation
const generateSwagger = async () => {
  try {
    console.log("📝 Generating Swagger documentation...");
    await swagger(outputFile, endpointsFiles, doc);
    console.log("✅ Swagger documentation generated successfully!");
    console.log(`📄 Output file: ${outputFile}`);
  } catch (error) {
    console.error("❌ Error generating Swagger documentation:", error);
    process.exit(1);
  }
};

generateSwagger();

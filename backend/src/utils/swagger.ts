export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'College Admin Panel API',
    version: '1.0.0',
    description: 'API documentation for College Admin Panel'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Admin: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          lastLogin: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Student: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phoneNumber: { type: 'string' },
          qualifications: {
            type: 'array',
            items: { type: 'string' }
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/api/auth/admin/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minimum: 2 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minimum: 6 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Admin registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    token: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login admin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/students': {
      get: {
        tags: ['Students'],
        summary: 'Get all students',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 }
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'List of students',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    students: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Student' }
                    },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    total: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Students'],
        summary: 'Create new student',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phoneNumber', 'qualifications', 'gender'],
                properties: {
                  name: { type: 'string', minimum: 2 },
                  email: { type: 'string', format: 'email' },
                  phoneNumber: { type: 'string' },
                  qualifications: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  gender: {
                    type: 'string',
                    enum: ['male', 'female', 'other']
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Student created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' }
              }
            }
          }
        }
      }
    },
    '/api/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get student by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Student details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Students'],
        summary: 'Update student',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minimum: 2 },
                  email: { type: 'string', format: 'email' },
                  phoneNumber: { type: 'string' },
                  qualifications: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  gender: {
                    type: 'string',
                    enum: ['male', 'female', 'other']
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Student updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Student' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Students'],
        summary: 'Delete student',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Student deleted successfully'
          }
        }
      }
    },
    '/api/students/{id}/profile-image': {
      post: {
        tags: ['Students'],
        summary: 'Upload student profile image',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  profileImage: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile image uploaded successfully'
          }
        }
      },
      get: {
        tags: ['Students'],
        summary: 'Get student profile image',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Profile image',
            content: {
              'image/jpeg': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Reset email sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/reset-password': {
      put: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minimum: 6 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successful'
          }
        }
      }
    },
    '/api/admin/profile': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Admin profile retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Admin' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Admin'],
        summary: 'Update admin profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minimum: 2 },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Admin' }
              }
            }
          }
        }
      }
    },
    '/api/admin/change-password': {
      put: {
        tags: ['Admin'],
        summary: 'Change admin password',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minimum: 6 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password changed successfully'
          }
        }
      }
    },
    '/api/admin/profile/picture': {
      post: {
        tags: ['Admin'],
        summary: 'Upload admin profile picture',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  profilePicture: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile picture uploaded successfully'
          }
        }
      },
      get: {
        tags: ['Admin'],
        summary: 'Get admin profile picture',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile picture',
            content: {
              'image/jpeg': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      }
    }
  }
}; 
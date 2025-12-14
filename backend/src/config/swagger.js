export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Campus Human Talent API',
        version: '1.0.1',
        description: `API para la gestión de evaluaciones de talento humano
        
**Características principales:**
- Autenticación con JWT (Cookie httpOnly o Bearer token)
- Gestión de usuarios, roles y permisos
- Creación y administración de encuestas de evaluación
- Ciclos de evaluación con estados (Abierto/Cerrado)
- Sistema de respuestas con cálculo automático de totales
- Estadísticas y rankings de desempeño
- Validación de datos en todas las operaciones

**Seguridad:**
- Autenticación requerida en la mayoría de endpoints
- Algunos endpoints requieren rol de Administrador
- Rate limiting configurado (100 requests por 15 minutos)
- Cookies firmadas y httpOnly para JWT`,
        contact: {
            name: 'API Support',
            email: 'support@campushumantalent.com'
        },
        license: {
            name: 'ISC'
        }
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Servidor de desarrollo'
        },
        {
            url: 'http://127.0.0.1:5000',
            description: 'Servidor de desarrollo (127.0.0.1)'
        }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'token',
                description: 'JWT almacenado en cookie httpOnly'
            },
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT en header Authorization: Bearer <token>'
            }
        },
        schemas: {
            Usuario: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Juan' },
                    apellido: { type: 'string', example: 'Pérez' },
                    email: { type: 'string', format: 'email', example: 'juan.perez@example.com' },
                    telefono: { type: 'string', pattern: '^[0-9]{10}$', example: '1234567890' },
                    id_rol: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_estado: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_area_trabajo: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_cargo: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    sobremi: { type: 'string', example: 'Descripción personal' },
                    linkedIn: { type: 'string', example: 'https://linkedin.com/in/usuario' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            AreaTrabajo: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Recursos Humanos' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Cargo: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Desarrollador' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            TipoEncuesta: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Evaluación de Desempeño' },
                    descripcion: { type: 'string', example: 'Encuesta para evaluar el desempeño laboral' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            TipoPregunta: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Competencia Técnica' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            TipoRespuesta: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Escala de Likert', enum: ['Si o No', 'Escala de Likert', 'Abierta'] },
                    descripcion: { type: 'string', example: 'Escala del 1 al 5' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Pregunta: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    pregunta: { type: 'string', example: '¿El empleado cumple con sus objetivos?' },
                    id_tipo_pregunta: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_tipo_respuesta: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Encuesta: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Evaluación Trimestral' },
                    descripcion: { type: 'string', example: 'Evaluación del desempeño del Q1' },
                    id_tipo_encuesta: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_preguntas: { 
                        type: 'array', 
                        items: { type: 'string' },
                        example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
                    },
                    fecha_creacion: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            CicloEvaluacion: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    nombre: { type: 'string', example: 'Ciclo Q1 2024' },
                    descripcion: { type: 'string', example: 'Primer trimestre del año' },
                    encuesta_Id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    fecha_inicio: { type: 'string', format: 'date', example: '2024-01-01' },
                    fecha_fin: { type: 'string', format: 'date', example: '2024-03-31' },
                    estado: { type: 'string', enum: ['Abierto', 'Cerrado'], example: 'Abierto' },
                    creado_por: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            RespuestaEncuesta: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_ciclo: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_encuesta: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_usuario_evaluador: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_usuario_evaluado: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_area_trabajo: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    id_cargo: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    fecha_realizacion: { type: 'string', format: 'date-time' },
                    respuestas: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id_pregunta: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                respuesta: { 
                                    oneOf: [
                                        { type: 'string', example: 'Sí' },
                                        { type: 'number', example: 5 }
                                    ]
                                },
                                valor_numerico: { type: 'number', example: 5 }
                            }
                        }
                    },
                    total: { type: 'number', example: 25 },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    mensaje: { type: 'string', example: 'Error al procesar la solicitud' },
                    errores: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                msg: { type: 'string' },
                                param: { type: 'string' },
                                location: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    },
    paths: {
        '/usuarios/login': {
            post: {
                tags: ['Autenticación'],
                summary: 'Iniciar sesión',
                description: 'Autentica un usuario y devuelve un JWT en cookie httpOnly',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'yerick.lopez@example.com' },
                                    password: { type: 'string', format: 'password', example: 'password123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login exitoso',
                        headers: {
                            'Set-Cookie': {
                                description: 'Cookie JWT firmada',
                                schema: { type: 'string', example: 'token=eyJhbGc...; Path=/; HttpOnly; Secure' }
                            }
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        usuario: { $ref: '#/components/schemas/Usuario' },
                                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Credenciales inválidas',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' }
                            }
                        }
                    }
                }
            }
        },
        '/usuarios': {
            get: {
                tags: ['Usuarios'],
                summary: 'Obtener todos los usuarios',
                description: 'Requiere autenticación',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de usuarios',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Usuario' }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado' }
                }
            },
            post: {
                tags: ['Usuarios'],
                summary: 'Crear usuario (Admin)',
                description: 'Requiere rol de Administrador',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre', 'apellido', 'email', 'password', 'telefono', 'id_rol', 'id_estado', 'id_area_trabajo', 'id_cargo'],
                                properties: {
                                    nombre: { type: 'string' },
                                    apellido: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    telefono: { type: 'string', pattern: '^[0-9]{10}$' },
                                    id_rol: { type: 'string' },
                                    id_estado: { type: 'string' },
                                    id_area_trabajo: { type: 'string' },
                                    id_cargo: { type: 'string' },
                                    sobremi: { type: 'string' },
                                    linkedIn: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Usuario creado',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        usuario: { $ref: '#/components/schemas/Usuario' },
                                        token: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Datos inválidos' },
                    403: { description: 'Requiere rol Administrador' }
                }
            }
        },
        '/usuarios/{id}': {
            get: {
                tags: ['Usuarios'],
                summary: 'Obtener usuario por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del usuario'
                    }
                ],
                responses: {
                    200: {
                        description: 'Usuario encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Usuario' }
                            }
                        }
                    },
                    404: { description: 'Usuario no encontrado' }
                }
            },
            delete: {
                tags: ['Usuarios'],
                summary: 'Eliminar usuario (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Usuario eliminado' },
                    403: { description: 'Requiere rol Administrador' },
                    404: { description: 'Usuario no encontrado' }
                }
            }
        },
        '/usuarios/admin/{id}': {
            put: {
                tags: ['Usuarios'],
                summary: 'Editar usuario como admin',
                description: 'Permite editar todos los campos del usuario (requiere rol Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    apellido: { type: 'string' },
                                    email: { type: 'string' },
                                    telefono: { type: 'string' },
                                    id_rol: { type: 'string' },
                                    id_estado: { type: 'string' },
                                    id_area_trabajo: { type: 'string' },
                                    id_cargo: { type: 'string' },
                                    sobremi: { type: 'string' },
                                    linkedIn: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Usuario actualizado' },
                    403: { description: 'Requiere rol Administrador' }
                }
            }
        },
        '/usuarios/perfil/{id}': {
            put: {
                tags: ['Usuarios'],
                summary: 'Editar perfil propio',
                description: 'Solo permite editar telefono, sobremi y linkedIn',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    telefono: { type: 'string' },
                                    sobremi: { type: 'string' },
                                    linkedIn: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Perfil actualizado' }
                }
            }
        },
        '/areas-trabajo': {
            get: {
                tags: ['Áreas de Trabajo'],
                summary: 'Obtener todas las áreas',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de áreas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/AreaTrabajo' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Áreas de Trabajo'],
                summary: 'Crear área (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre'],
                                properties: {
                                    nombre: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Área creada' },
                    403: { description: 'Requiere rol Administrador' }
                }
            }
        },
        '/areas-trabajo/{id}': {
            get: {
                tags: ['Áreas de Trabajo'],
                summary: 'Obtener área por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Área encontrada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AreaTrabajo' }
                            }
                        }
                    },
                    404: { description: 'Área no encontrada' }
                }
            },
            put: {
                tags: ['Áreas de Trabajo'],
                summary: 'Editar área (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Área actualizada' },
                    403: { description: 'Requiere rol Administrador' }
                }
            },
            delete: {
                tags: ['Áreas de Trabajo'],
                summary: 'Eliminar área (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Área eliminada' },
                    403: { description: 'Requiere rol Administrador' }
                }
            }
        },
        '/cargos': {
            get: {
                tags: ['Cargos'],
                summary: 'Obtener todos los cargos',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de cargos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Cargo' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Cargos'],
                summary: 'Crear cargo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre'],
                                properties: {
                                    nombre: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Cargo creado' },
                    403: { description: 'Requiere rol Administrador' }
                }
            }
        },
        '/cargos/{id}': {
            get: {
                tags: ['Cargos'],
                summary: 'Obtener cargo por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Cargo encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Cargo' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Cargos'],
                summary: 'Editar cargo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Cargo actualizado' }
                }
            },
            delete: {
                tags: ['Cargos'],
                summary: 'Eliminar cargo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Cargo eliminado' }
                }
            }
        },
        '/tipo-encuestas': {
            get: {
                tags: ['Tipos de Encuestas'],
                summary: 'Obtener todos los tipos',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de tipos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/TipoEncuesta' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Tipos de Encuestas'],
                summary: 'Crear tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre', 'descripcion'],
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tipo creado' }
                }
            }
        },
        '/tipo-encuestas/{id}': {
            get: {
                tags: ['Tipos de Encuestas'],
                summary: 'Obtener tipo por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Tipo encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TipoEncuesta' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Tipos de Encuestas'],
                summary: 'Editar tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tipo actualizado' }
                }
            },
            delete: {
                tags: ['Tipos de Encuestas'],
                summary: 'Eliminar tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Tipo eliminado' }
                }
            }
        },
        '/tipo-preguntas': {
            get: {
                tags: ['Tipos de Preguntas'],
                summary: 'Obtener todos los tipos',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de tipos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/TipoPregunta' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Tipos de Preguntas'],
                summary: 'Crear tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre'],
                                properties: {
                                    nombre: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tipo creado' }
                }
            }
        },
        '/tipo-preguntas/{id}': {
            get: {
                tags: ['Tipos de Preguntas'],
                summary: 'Obtener tipo por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Tipo encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TipoPregunta' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Tipos de Preguntas'],
                summary: 'Editar tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tipo actualizado' }
                }
            },
            delete: {
                tags: ['Tipos de Preguntas'],
                summary: 'Eliminar tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Tipo eliminado' }
                }
            }
        },
        '/tipo-respuestas': {
            get: {
                tags: ['Tipos de Respuestas'],
                summary: 'Obtener todos los tipos',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de tipos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/TipoRespuesta' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Tipos de Respuestas'],
                summary: 'Crear tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre', 'descripcion'],
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Tipo creado' }
                }
            }
        },
        '/tipo-respuestas/{id}': {
            get: {
                tags: ['Tipos de Respuestas'],
                summary: 'Obtener tipo por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Tipo encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TipoRespuesta' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Tipos de Respuestas'],
                summary: 'Editar tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tipo actualizado' }
                }
            },
            delete: {
                tags: ['Tipos de Respuestas'],
                summary: 'Eliminar tipo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Tipo eliminado' }
                }
            }
        },
        '/preguntas': {
            get: {
                tags: ['Preguntas'],
                summary: 'Obtener todas las preguntas',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de preguntas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Pregunta' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Preguntas'],
                summary: 'Crear pregunta (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['pregunta', 'id_tipo_pregunta', 'id_tipo_respuesta'],
                                properties: {
                                    pregunta: { type: 'string' },
                                    id_tipo_pregunta: { type: 'string' },
                                    id_tipo_respuesta: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Pregunta creada' }
                }
            }
        },
        '/preguntas/{id}': {
            get: {
                tags: ['Preguntas'],
                summary: 'Obtener pregunta por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Pregunta encontrada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Pregunta' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Preguntas'],
                summary: 'Editar pregunta (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    pregunta: { type: 'string' },
                                    id_tipo_pregunta: { type: 'string' },
                                    id_tipo_respuesta: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Pregunta actualizada' }
                }
            },
            delete: {
                tags: ['Preguntas'],
                summary: 'Eliminar pregunta (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Pregunta eliminada' }
                }
            }
        },
        '/encuestas': {
            get: {
                tags: ['Encuestas'],
                summary: 'Obtener todas las encuestas',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de encuestas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Encuesta' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Encuestas'],
                summary: 'Crear encuesta (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre', 'descripcion', 'id_tipo_encuesta', 'id_preguntas'],
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' },
                                    id_tipo_encuesta: { type: 'string' },
                                    id_preguntas: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        minItems: 1
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Encuesta creada' }
                }
            }
        },
        '/encuestas/{id}': {
            get: {
                tags: ['Encuestas'],
                summary: 'Obtener encuesta por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Encuesta encontrada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Encuesta' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Encuestas'],
                summary: 'Editar encuesta (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' },
                                    id_tipo_encuesta: { type: 'string' },
                                    id_preguntas: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Encuesta actualizada' }
                }
            },
            delete: {
                tags: ['Encuestas'],
                summary: 'Eliminar encuesta (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Encuesta eliminada' }
                }
            }
        },
        '/ciclos-evaluacion': {
            get: {
                tags: ['Ciclos de Evaluación'],
                summary: 'Obtener todos los ciclos',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de ciclos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/CicloEvaluacion' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Ciclos de Evaluación'],
                summary: 'Crear ciclo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nombre', 'descripcion', 'encuesta_Id', 'fecha_inicio', 'fecha_fin', 'creado_por'],
                                properties: {
                                    nombre: { type: 'string' },
                                    descripcion: { type: 'string' },
                                    encuesta_Id: { type: 'string' },
                                    fecha_inicio: { type: 'string', format: 'date' },
                                    fecha_fin: { type: 'string', format: 'date' },
                                    estado: { type: 'string', enum: ['Abierto', 'Cerrado'], default: 'Abierto' },
                                    creado_por: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Ciclo creado' }
                }
            }
        },
        '/ciclos-evaluacion/{id}': {
            get: {
                tags: ['Ciclos de Evaluación'],
                summary: 'Obtener ciclo por ID',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Ciclo encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CicloEvaluacion' }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['Ciclos de Evaluación'],
                summary: 'Cambiar estado del ciclo (Admin)',
                description: 'Permite cambiar el estado entre Abierto y Cerrado',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['estado'],
                                properties: {
                                    estado: { type: 'string', enum: ['Abierto', 'Cerrado'] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Estado actualizado' }
                }
            }
        },
        '/respuesta-encuestas': {
            get: {
                tags: ['Respuestas de Encuestas'],
                summary: 'Obtener todas las respuestas (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de respuestas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/RespuestaEncuesta' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['Respuestas de Encuestas'],
                summary: 'Crear respuesta',
                description: 'Permite a cualquier usuario autenticado responder una encuesta. Valida que el ciclo esté abierto.',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['id_ciclo', 'id_encuesta', 'id_usuario_evaluador', 'id_usuario_evaluado', 'id_area_trabajo', 'id_cargo', 'respuestas'],
                                properties: {
                                    id_ciclo: { type: 'string' },
                                    id_encuesta: { type: 'string' },
                                    id_usuario_evaluador: { type: 'string' },
                                    id_usuario_evaluado: { type: 'string' },
                                    id_area_trabajo: { type: 'string' },
                                    id_cargo: { type: 'string' },
                                    respuestas: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            required: ['id_pregunta', 'respuesta'],
                                            properties: {
                                                id_pregunta: { type: 'string' },
                                                respuesta: {
                                                    oneOf: [
                                                        { type: 'string', example: 'Sí' },
                                                        { type: 'number', minimum: 1, maximum: 5 }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Respuesta creada. El total se calcula automáticamente.' },
                    400: { description: 'Ciclo cerrado o respuesta duplicada' }
                }
            }
        },
        '/respuesta-encuestas/{id}': {
            get: {
                tags: ['Respuestas de Encuestas'],
                summary: 'Obtener respuesta por ID (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Respuesta encontrada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RespuestaEncuesta' }
                            }
                        }
                    }
                }
            }
        },
        '/respuesta-encuestas/ciclo/{id}': {
            get: {
                tags: ['Respuestas de Encuestas'],
                summary: 'Obtener respuestas por ciclo (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del ciclo de evaluación'
                    }
                ],
                responses: {
                    200: {
                        description: 'Lista de respuestas del ciclo',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/RespuestaEncuesta' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/respuesta-encuestas/evaluador/{id}': {
            get: {
                tags: ['Respuestas de Encuestas'],
                summary: 'Obtener respuestas por evaluador (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del usuario evaluador'
                    }
                ],
                responses: {
                    200: {
                        description: 'Lista de respuestas realizadas por el evaluador',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/RespuestaEncuesta' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/respuesta-encuestas/evaluado/{id}': {
            get: {
                tags: ['Respuestas de Encuestas'],
                summary: 'Obtener respuestas por evaluado (Admin)',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del usuario evaluado'
                    }
                ],
                responses: {
                    200: {
                        description: 'Lista de respuestas recibidas por el evaluado',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/RespuestaEncuesta' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/health': {
            get: {
                tags: ['Sistema'],
                summary: 'Health check',
                description: 'Verifica que el servidor esté activo',
                responses: {
                    200: {
                        description: 'Servidor activo',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string', example: 'Backend Activo' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/version': {
            get: {
                tags: ['Sistema'],
                summary: 'Verificar compatibilidad de versión',
                description: 'Valida si la versión del cliente es compatible con la API',
                parameters: [
                    {
                        name: 'v',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Versión del cliente (formato semver: 1.2.3)',
                        example: '1.0.0'
                    }
                ],
                responses: {
                    200: {
                        description: 'Versión compatible',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                        verRecibida: { type: 'string' },
                                        requerido: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Versión no proporcionada o inválida',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: { type: 'string' },
                                        verRecibida: { type: 'string' },
                                        ejemploValido: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    426: {
                        description: 'Versión incompatible - requiere actualización',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: { type: 'string' },
                                        apiVersion: { type: 'string' },
                                        requerido: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/roles': {
            get: {
                tags: ['Roles'],
                summary: 'Obtener todos los roles',
                description: 'Obtiene la lista completa de roles del sistema',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista de roles',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                            nombre: { type: 'string', example: 'Administrador' },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            updatedAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/roles/{id}': {
            get: {
                tags: ['Roles'],
                summary: 'Obtener rol por ID',
                description: 'Obtiene los detalles de un rol específico',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del rol'
                    }
                ],
                responses: {
                    200: {
                        description: 'Rol encontrado',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        _id: { type: 'string' },
                                        nombre: { type: 'string' },
                                        createdAt: { type: 'string', format: 'date-time' },
                                        updatedAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Rol no encontrado' },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/estadisticas/usuario/{id}': {
            get: {
                tags: ['Estadísticas'],
                summary: 'Obtener estadísticas de un usuario',
                description: 'Obtiene las estadísticas generales de un usuario específico',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del usuario'
                    }
                ],
                responses: {
                    200: {
                        description: 'Estadísticas del usuario',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        usuario_id: { type: 'string' },
                                        total_evaluaciones: { type: 'number' },
                                        promedio_general: { type: 'number' },
                                        mejor_ciclo: { type: 'object' },
                                        peor_ciclo: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Usuario no encontrado' },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/estadisticas/usuario/{id}/ciclo/{id_ciclo}': {
            get: {
                tags: ['Estadísticas'],
                summary: 'Obtener estadísticas de un usuario por ciclo',
                description: 'Obtiene las estadísticas de un usuario en un ciclo específico',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del usuario'
                    },
                    {
                        name: 'id_ciclo',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del ciclo de evaluación'
                    }
                ],
                responses: {
                    200: {
                        description: 'Estadísticas del usuario en el ciclo',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        usuario_id: { type: 'string' },
                                        ciclo_id: { type: 'string' },
                                        promedio_ciclo: { type: 'number' },
                                        total_evaluaciones_ciclo: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Usuario o ciclo no encontrado' },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/estadisticas/usuario/{id}/calcular': {
            post: {
                tags: ['Estadísticas'],
                summary: 'Calcular estadísticas de un usuario',
                description: 'Recalcula las estadísticas de un usuario específico',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID del usuario'
                    }
                ],
                responses: {
                    200: {
                        description: 'Estadísticas calculadas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        mensaje: { type: 'string', example: 'Estadísticas calculadas correctamente' },
                                        estadisticas: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Usuario no encontrado' },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/estadisticas/ranking': {
            get: {
                tags: ['Estadísticas'],
                summary: 'Obtener ranking de usuarios',
                description: 'Obtiene el ranking de usuarios ordenados por promedio general',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Ranking de usuarios',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            posicion: { type: 'number' },
                                            usuario_id: { type: 'string' },
                                            nombre_completo: { type: 'string' },
                                            promedio_general: { type: 'number' },
                                            total_evaluaciones: { type: 'number' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/estadisticas/recalcular-todas': {
            post: {
                tags: ['Estadísticas'],
                summary: 'Recalcular todas las estadísticas (Admin)',
                description: 'Recalcula las estadísticas de todos los usuarios del sistema. Requiere rol de Administrador.',
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Estadísticas recalculadas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        mensaje: { type: 'string', example: 'Todas las estadísticas han sido recalculadas' },
                                        total_usuarios: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    403: { description: 'Requiere rol Administrador' },
                    401: { description: 'No autorizado' }
                }
            }
        }
    },
    tags: [
        { name: 'Autenticación', description: 'Endpoints de autenticación y sesión' },
        { name: 'Usuarios', description: 'Gestión de usuarios' },
        { name: 'Roles', description: 'Consulta de roles del sistema' },
        { name: 'Áreas de Trabajo', description: 'Gestión de áreas de trabajo' },
        { name: 'Cargos', description: 'Gestión de cargos' },
        { name: 'Tipos de Encuestas', description: 'Gestión de tipos de encuestas' },
        { name: 'Tipos de Preguntas', description: 'Gestión de tipos de preguntas' },
        { name: 'Tipos de Respuestas', description: 'Gestión de tipos de respuestas' },
        { name: 'Preguntas', description: 'Gestión de preguntas' },
        { name: 'Encuestas', description: 'Gestión de encuestas' },
        { name: 'Ciclos de Evaluación', description: 'Gestión de ciclos de evaluación' },
        { name: 'Respuestas de Encuestas', description: 'Gestión de respuestas de encuestas' },
        { name: 'Estadísticas', description: 'Consulta de estadísticas y rankings' },
        { name: 'Sistema', description: 'Endpoints del sistema (health check, versiones)' }
    ]
};
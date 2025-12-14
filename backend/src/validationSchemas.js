import mongoose from 'mongoose';

const areaTrabajoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del área es requerido'],
        unique: true,
        trim: true
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'areas_trabajo'
});

export const AreaTrabajo = mongoose.model('AreaTrabajo', areaTrabajoSchema);


const cargoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del cargo es requerido'],
        unique: true,
        trim: true
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'cargo'
});

export const Cargo = mongoose.model('Cargo', cargoSchema);


const estadoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del estado es requerido'],
        unique: true,
        trim: true,
        enum: ['Activo', 'Inactivo']
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'estado'
});

export const Estado = mongoose.model('Estado', estadoSchema);


const rolSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del rol es requerido'],
        unique: true,
        trim: true,
        enum: ['Administrador', 'Empleado']
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'roles'
});

export const Rol = mongoose.model('Rol', rolSchema);


const tipoPreguntaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del tipo de pregunta es requerido'],
        unique: true,
        trim: true
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'tipo_preguntas'
});

export const TipoPregunta = mongoose.model('TipoPregunta', tipoPreguntaSchema);


const tipoEncuestaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del tipo de encuesta es requerido'],
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'tipo_encuestas'
});

export const TipoEncuesta = mongoose.model('TipoEncuesta', tipoEncuestaSchema);


const tipoRespuestaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del tipo de respuesta es requerido'],
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'tipo_respuestas'
});

export const TipoRespuesta = mongoose.model('TipoRespuesta', tipoRespuestaSchema);


const preguntaSchema = new mongoose.Schema({
    pregunta: {
        type: String,
        required: [true, 'El texto de la pregunta es requerido'],
        trim: true
    },
    id_tipo_pregunta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoPregunta',
        required: [true, 'El tipo de pregunta es requerido']
    },
    id_tipo_respuesta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoRespuesta',
        required: [true, 'El tipo de respuesta es requerido']
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'preguntas'
});

export const Pregunta = mongoose.model('Pregunta', preguntaSchema);


const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true,
        match: [/^[0-9]{10}$/, 'El teléfono debe tener exactamente 10 dígitos']
    },
    id_rol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rol',
        required: [true, 'El rol es requerido']
    },
    id_estado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estado',
        required: [true, 'El estado es requerido']
    },
    id_area_trabajo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AreaTrabajo',
        required: [true, 'El área de trabajo es requerida']
    },
    id_cargo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cargo',
        required: [true, 'El cargo es requerido']
    },
    sobremi: {
        type: String,
        default: '',
        trim: true
    },
    linkedIn: {
        type: String,
        default: '',
        trim: true
    },
    estadisticas_evaluacion: {
        promedio_general: { 
            type: Number, 
            default: 0,
            min: 0,
            max: 100
        },
        total_evaluaciones: { 
            type: Number, 
            default: 0,
            min: 0
        },
        ultimo_calculo: { 
            type: Date, 
            default: null 
        },
        evaluaciones_por_ciclo: [{
            id_ciclo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CicloEvaluacion'
            },
            promedio_ciclo: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            total_respuestas: {
                type: Number,
                default: 0
            },
            fecha_calculo: {
                type: Date,
                default: Date.now
            }
        }]
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'usuarios'
});


export const Usuario = mongoose.model('Usuario', usuarioSchema);


const encuestaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la encuesta es requerido'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },
    id_tipo_encuesta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoEncuesta',
        required: [true, 'El tipo de encuesta es requerido']
    },
    id_preguntas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pregunta'
    }],
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'encuestas'
});

encuestaSchema.path('id_preguntas').validate(function(value) {
    return value && value.length > 0;
}, 'La encuesta debe tener al menos una pregunta');


export const Encuesta = mongoose.model('Encuesta', encuestaSchema);


const respuestaIndividualSchema = new mongoose.Schema({
    id_pregunta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pregunta',
        required: true
    },

    respuesta: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function(value) {
                
                return value !== null && value !== undefined && value !== '';
            },
            message: 'La respuesta es requerida'
        }
    },

    valor_numerico: {
        type: Number,
        default: 0
    }
}, { _id: false });

const respuestaEncuestaSchema = new mongoose.Schema({
    id_ciclo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CicloEvaluacion',
        required: [true, 'El ID del ciclo es requerido']
    },
    id_encuesta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encuesta',
        required: [true, 'El ID de la encuesta es requerido']
    },
    id_usuario_evaluador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El ID del evaluador es requerido']
    },
    id_usuario_evaluado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El ID del evaluado es requerido']
    },
    id_area_trabajo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AreaTrabajo',
        required: [true, 'El área de trabajo es requerida']
    },
    id_cargo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cargo',
        required: [true, 'El cargo es requerido']
    },
    fecha_realizacion: {
        type: Date,
        default: Date.now
    },
    respuestas: [respuestaIndividualSchema],
    total: {
        type: Number,
        default: 0
    },
    puntaje_maximo_posible: {
        type: Number,
        default: 0,
        min: 0
    },
    promedio_normalizado: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'respuestas_encuestas'
});

// Middleware pre-save para calcular total automaticamente
respuestaEncuestaSchema.pre('save', async function() {
    try {
        if (this.respuestas && this.respuestas.length > 0) {
            // Cargar las preguntas con sus tipos de respuesta para calcular correctamente
            const preguntasIds = this.respuestas.map(r => r.id_pregunta);
            const preguntas = await Pregunta.find({ _id: { $in: preguntasIds } })
                .populate('id_tipo_respuesta');
            
            // Crear un mapa de preguntas para acceso rápido
            const preguntasMap = {};
            preguntas.forEach(p => {
                preguntasMap[p._id.toString()] = p;
            });
            
            // Calcular valor_numerico según el tipo de respuesta
            this.respuestas.forEach(respuesta => {
                const pregunta = preguntasMap[respuesta.id_pregunta.toString()];
                if (pregunta && pregunta.id_tipo_respuesta) {
                    const tipoRespuesta = pregunta.id_tipo_respuesta.nombre;
                    
                    // Calcular valor según el tipo
                    if (tipoRespuesta === 'Si o No') {
                        // Tipo binario: Sí = 1, No = 0
                        respuesta.valor_numerico = respuesta.respuesta === 'Sí' ? 1 : 0;
                    } else if (tipoRespuesta === 'Escala de Likert') {
                        // Tipo escala: usar el valor numérico directamente (1-5)
                        respuesta.valor_numerico = typeof respuesta.respuesta === 'number' 
                            ? respuesta.respuesta 
                            : parseInt(respuesta.respuesta) || 0;
                    } else if (tipoRespuesta === 'Abierta') {
                        // Tipo abierto: no suma puntos, valor = 0
                        respuesta.valor_numerico = 0;
                    }
                }
            });
            
            // Calcular total sumando valores numéricos
            this.total = this.respuestas.reduce((sum, r) => sum + (r.valor_numerico || 0), 0);
            
            // Calcular puntaje máximo posible según tipos de pregunta
            let puntajeMaximo = 0;
            this.respuestas.forEach(respuesta => {
                const pregunta = preguntasMap[respuesta.id_pregunta.toString()];
                if (pregunta && pregunta.id_tipo_respuesta) {
                    const tipoRespuesta = pregunta.id_tipo_respuesta.nombre;
                    if (tipoRespuesta === 'Si o No') {
                        puntajeMaximo += 1;
                    } else if (tipoRespuesta === 'Escala de Likert') {
                        puntajeMaximo += 5;
                    }
                    // Abierta no suma al máximo
                }
            });
            
            this.puntaje_maximo_posible = puntajeMaximo;
            
            // Calcular promedio normalizado (0-100)
            if (puntajeMaximo > 0) {
                this.promedio_normalizado = Math.round((this.total / puntajeMaximo) * 100);
            } else {
                this.promedio_normalizado = 0;
            }
        }
    } catch (error) {
        throw error;
    }
});

// Middleware post-save para actualizar estadísticas del usuario evaluado automáticamente
respuestaEncuestaSchema.post('save', async function(doc) {
    try {
        // Importar dinámicamente para evitar dependencias circulares
        const { calcularYActualizarEstadisticas } = await import('./services/estadisticas.services.js');
        
        // Actualizar estadísticas del usuario evaluado
        if (doc.id_usuario_evaluado) {
            await calcularYActualizarEstadisticas(doc.id_usuario_evaluado);
            console.log(`✅ Estadísticas actualizadas automáticamente para usuario: ${doc.id_usuario_evaluado}`);
        }
    } catch (error) {
        // No fallar la operación principal si falla la actualización de estadísticas
        console.error('⚠️ Error al actualizar estadísticas automáticamente:', error.message);
    }
});


export const RespuestaEncuesta = mongoose.model('RespuestaEncuesta', respuestaEncuestaSchema);

const cicloEvaluacionSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del ciclo de evaluación es requerido'],
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true
    },
    encuesta_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encuesta',
        required: [true, 'El ID de la encuesta es requerido']
    },
    fecha_inicio: {
        type: Date,
        required: [true, 'La fecha de inicio es requerida']
    },
    fecha_fin: {
        type: Date,
        required: [true, 'La fecha de fin es requerida']
    },
    estado: {
        type: String,
        required: [true, 'El estado es requerido'],
        enum: ['Abierto', 'Cerrado'],
        default: 'Abierto'
    },
    creado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El ID del usuario que creó el ciclo es requerido']
    }
}, { 
    timestamps: true,
    versionKey: false,
    collection: 'ciclos_evaluacion'
});

export const CicloEvaluacion = mongoose.model('CicloEvaluacion', cicloEvaluacionSchema);

export default {
    AreaTrabajo,
    Cargo,
    Estado,
    Rol,
    TipoPregunta,
    TipoEncuesta,
    TipoRespuesta,
    Pregunta,
    Usuario,
    Encuesta,
    RespuestaEncuesta,
    CicloEvaluacion
};

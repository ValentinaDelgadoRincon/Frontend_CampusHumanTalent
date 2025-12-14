import { body, param } from 'express-validator';

export const crearUsuarioDTO = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
    body('apellido')
        .notEmpty().withMessage('El apellido es obligatorio')
        .trim()
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El apellido no debe exceder los 100 caracteres'),
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .trim()
        .isEmail().withMessage('El email debe ser válido')
        .isLength({ max: 150 }).withMessage('El email no debe exceder los 150 caracteres'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('id_rol')
        .notEmpty().withMessage('El ID del rol es obligatorio')
        .isMongoId().withMessage('El ID del rol debe ser un ID de MongoDB válido'),
    body('id_estado')
        .notEmpty().withMessage('El ID del estado es obligatorio')
        .isMongoId().withMessage('El ID del estado debe ser un ID de MongoDB válido'),
    body('id_area_trabajo')
        .notEmpty().withMessage('El ID del área de trabajo es obligatorio')
        .isMongoId().withMessage('El ID del área de trabajo debe ser un ID de MongoDB válido'),
    body('id_cargo')
        .notEmpty().withMessage('El ID del cargo es obligatorio')
        .isMongoId().withMessage('El ID del cargo debe ser un ID de MongoDB válido'),
    body('telefono')
        .optional()
        .trim()
        .isString().withMessage('El teléfono debe ser una cadena de texto')
        .isLength({ max: 10 }).withMessage('El teléfono no debe exceder los 10 caracteres'),
    body('sobremi')
        .optional()
        .trim()
        .isString().withMessage('El campo "sobre mí" debe ser una cadena de texto')
        .isLength({ max: 500 }).withMessage('El campo "sobre mí" no debe exceder los 500 caracteres'),
    body('linkedIn')
        .optional()
        .trim()
        .isURL().withMessage('El enlace de LinkedIn debe ser una URL válida')
        .isLength({ max: 200 }).withMessage('El enlace de LinkedIn no debe exceder los 200 caracteres')
];

export const editarUsuarioDTO = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isMongoId().withMessage('El ID debe ser un ID de MongoDB válido'),
    body('nombre')
        .optional()
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
    body('apellido')
        .optional()
        .trim()
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El apellido no debe exceder los 100 caracteres'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('El email debe ser válido')
        .isLength({ max: 150 }).withMessage('El email no debe exceder los 150 caracteres'),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('id_rol')
        .optional()
        .isMongoId().withMessage('El ID del rol debe ser un ID de MongoDB válido'),
    body('id_estado')
        .optional()
        .isMongoId().withMessage('El ID del estado debe ser un ID de MongoDB válido'),
    body('id_area_trabajo')
        .optional()
        .isMongoId().withMessage('El ID del área de trabajo debe ser un ID de MongoDB válido'),
    body('id_cargo')
        .optional()
        .isMongoId().withMessage('El ID del cargo debe ser un ID de MongoDB válido'),
    body('telefono')
        .optional()
        .trim()
        .isString().withMessage('El teléfono debe ser una cadena de texto')
        .isLength({ max: 10 }).withMessage('El teléfono no debe exceder los 10 caracteres'),
    body('sobremi')
        .optional()
        .trim()
        .isString().withMessage('El campo "sobre mí" debe ser una cadena de texto')
        .isLength({ max: 500 }).withMessage('El campo "sobre mí" no debe exceder los 500 caracteres'),
    body('linkedIn')
        .optional()
        .trim()
        .isURL().withMessage('El enlace de LinkedIn debe ser una URL válida')
        .isLength({ max: 200 }).withMessage('El enlace de LinkedIn no debe exceder los 200 caracteres')
];

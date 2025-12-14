import { body, param } from 'express-validator';

export const crearTipoRespuestaDTO = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .trim()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .isLength({ max: 250 }).withMessage('La descripción no debe exceder los 250 caracteres')
];

export const editarTipoRespuestaDTO = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isMongoId().withMessage('El ID debe ser un ID de MongoDB válido'),
    body('nombre')
        .optional()
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
    body('descripcion')
        .optional()
        .trim()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .isLength({ max: 250 }).withMessage('La descripción no debe exceder los 250 caracteres')
];
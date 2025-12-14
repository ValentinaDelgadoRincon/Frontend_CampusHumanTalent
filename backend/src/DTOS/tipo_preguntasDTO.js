import { body, param } from 'express-validator';

export const crearTipoPreguntaDTO = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres')
];

export const editarTipoPreguntaDTO = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isMongoId().withMessage('El ID debe ser un ID de MongoDB válido'),
    body('nombre')
        .optional()
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres')
];


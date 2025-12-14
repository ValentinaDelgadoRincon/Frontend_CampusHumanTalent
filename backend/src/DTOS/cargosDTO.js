import { body, param } from "express-validator";

export const crearCargoDTO = [
    body('nombre')
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres')
];

export const editarCargoDTO = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isMongoId().withMessage('El ID debe ser un ID de MongoDB válido'),
    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres')
];

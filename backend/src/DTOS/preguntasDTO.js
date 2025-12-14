import { body, param } from "express-validator";

export const crearPreguntasDTO = [
    body('texto')
        .notEmpty().withMessage('El texto de la pregunta es obligatorio')
        .trim()
        .isString().withMessage('El texto debe ser una cadena de texto')
        .isLength({ max: 300 }).withMessage('El texto no debe exceder los 300 caracteres'),
    body('id_tipo_pregunta')
        .notEmpty().withMessage('El tipo de pregunta es obligatorio')
        .isMongoId().withMessage('El ID del tipo de pregunta debe ser un ID de MongoDB válido'),
    body('id_tipo_respuesta')
        .notEmpty().withMessage('El tipo de respuesta es obligatorio')
        .isMongoId().withMessage('El ID del tipo de respuesta debe ser un ID de MongoDB válido')
];

export const editarPreguntasDTO = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isMongoId().withMessage('El ID debe ser un ID de MongoDB válido'),
    body('texto')
        .optional()
        .isString().withMessage('El texto debe ser una cadena de texto')
        .trim()
        .isLength({ max: 300 }).withMessage('El texto no debe exceder los 300 caracteres'),
    body('id_tipo_pregunta')
        .optional()
        .isMongoId().withMessage('El ID del tipo de pregunta debe ser un ID de MongoDB válido'),
    body('id_tipo_respuesta')
        .optional()
        .isMongoId().withMessage('El ID del tipo de respuesta debe ser un ID de MongoDB válido')
];


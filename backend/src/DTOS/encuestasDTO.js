import { body, param } from "express-validator";

export const crearEncuestasDTO = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 200 }).withMessage('El nombre no debe exceder los 200 caracteres'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .trim()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .isLength({ max: 500 }).withMessage('La descripción no debe exceder los 500 caracteres'),
    body('id_tipo_encuesta')
        .notEmpty().withMessage('El ID del tipo de encuesta es obligatorio')
        .isMongoId().withMessage('El ID del tipo de encuesta debe ser un ID de MongoDB válido'),
    body('id_preguntas')
        .isArray({ min: 1 }).withMessage('Debe proporcionar un array con al menos una pregunta'),
    body('id_preguntas.*')
        .isMongoId().withMessage('Cada ID de pregunta debe ser un ID de MongoDB válido')
];

export const editarEncuestasDTO = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isMongoId().withMessage('El ID debe ser un ID de MongoDB válido'),
    body('nombre')
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .trim()
        .isLength({ max: 200 }).withMessage('El nombre no debe exceder los 200 caracteres'),
    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser una cadena de texto')
        .trim()
        .isLength({ max: 500 }).withMessage('La descripción no debe exceder los 500 caracteres'),
    body('id_tipo_encuesta')
        .optional()
        .isMongoId().withMessage('El ID del tipo de encuesta debe ser un ID de MongoDB válido'),
    body('id_preguntas')
        .optional()
        .isArray({ min: 1 }).withMessage('Debe proporcionar un array con al menos una pregunta'),
    body('id_preguntas.*')
        .optional()
        .isMongoId().withMessage('Cada ID de pregunta debe ser un ID de MongoDB válido')
];
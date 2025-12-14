import { body, param } from 'express-validator';

export const crearCicloEvaluacionDTO = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .isLength({ max: 100 }).withMessage('El nombre no debe exceder los 100 caracteres'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .trim()
        .isString().withMessage('La descripción debe ser una cadena de texto'),
    body('encuesta_Id')
        .notEmpty().withMessage('El ID de la encuesta es obligatorio')
        .isMongoId().withMessage('El ID de la encuesta debe ser un ID de MongoDB válido'),
    body('fecha_inicio')
        .notEmpty().withMessage('La fecha de inicio es obligatoria')
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida'),
    body('fecha_fin')
        .notEmpty().withMessage('La fecha de fin es obligatoria')
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida'),
    body('creado_por')
        .notEmpty().withMessage('El ID del creador es obligatorio')
        .isMongoId().withMessage('El ID del creador debe ser un ID de MongoDB válido')
];
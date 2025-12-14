import { body, param } from "express-validator";

export const crearRespuestaEncuestaDTO = [
    body('id_ciclo')
        .notEmpty().withMessage('El ID del ciclo es obligatorio')
        .isMongoId().withMessage('El ID del ciclo debe ser un ID de MongoDB válido'),
    body('id_encuesta')
        .notEmpty().withMessage('El ID de la encuesta es obligatorio')
        .isMongoId().withMessage('El ID de la encuesta debe ser un ID de MongoDB válido'),
    body('id_usuario_evaluador')
        .notEmpty().withMessage('El ID del usuario evaluador es obligatorio')
        .isMongoId().withMessage('El ID del usuario evaluador debe ser un ID de MongoDB válido'),
    body('id_usuario_evaluado')
        .notEmpty().withMessage('El ID del usuario evaluado es obligatorio')
        .isMongoId().withMessage('El ID del usuario evaluado debe ser un ID de MongoDB válido'),
    body('id_area_trabajo')
        .notEmpty().withMessage('El área de trabajo es obligatoria')
        .isMongoId().withMessage('El ID del área de trabajo debe ser un ID de MongoDB válido'),
    body('id_cargo')
        .notEmpty().withMessage('El cargo es obligatorio')
        .isMongoId().withMessage('El ID del cargo debe ser un ID de MongoDB válido'),
    body('respuestas')
        .isArray({ min: 1 }).withMessage('Las respuestas deben ser un arreglo con al menos una respuesta')
];
import { validationResult } from "express-validator";

export function validationDTO(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
    }
    next();
}
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config.js';
import { conectarBD } from './config/db.js';
import semver from 'semver';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';
import areasTrabajoRoutes from './routers/areas_trabajo.routes.js';
import cargosRoutes from './routers/cargos.routes.js';
import encuestasRoutes from './routers/encuestas.routes.js';
import preguntasRoutes from './routers/preguntas.routes.js';
import respuestaEncuestasRoutes from './routers/respuesta_encuestas.routes.js';
import tipoEncuestaRoutes from './routers/tipo_encuestas.routes.js';
import tipoPreguntaRoutes from './routers/tipo_preguntas.routes.js';
import tipoRespuestaRoutes from './routers/tipo_respuesta.routes.js';
import usuariosRoutes from './routers/usuarios.routes.js';
import ciclosEvaluacion from './routers/ciclos.routes.js';
import roles from './routers/roles.routes.js';
import estadisticasRoutes from './routers/estadisticas.routes.js';
import estadosRoutes from './routers/estados.routes.js';

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://localhost:8080',
    'http://localhost:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`El origen ${origin} no está permitido por CORS.`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/areas-trabajo', areasTrabajoRoutes);
app.use('/cargos', cargosRoutes);
app.use('/encuestas', encuestasRoutes);
app.use('/preguntas', preguntasRoutes);
app.use('/respuesta-encuestas', respuestaEncuestasRoutes);
app.use('/tipo-encuestas', tipoEncuestaRoutes);
app.use('/tipo-preguntas', tipoPreguntaRoutes);
app.use('/tipo-respuestas', tipoRespuestaRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/ciclos-evaluacion', ciclosEvaluacion);
app.use('/roles', roles);
app.use('/estadisticas', estadisticasRoutes);
app.use('/estados', estadosRoutes);

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde."
}));

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Backend Activo" });
});

app.get("/version", (req, res) => {
    const clientVersion = req.query.v;

    if (!clientVersion) {
        return res.status(400).json({ error: "Se debe proporcionar una version" });
    }

    const parsed = semver.coerce(clientVersion)?.version;

    if (!parsed || !semver.valid(parsed)) {
        return res.status(400).json({ error: "La versión no es válida", verRecibida: clientVersion, ejemploValido: "1.2.3" })
    }

    const es_compatible = semver.satisfies(parsed, process.env.MIN_RANGE);

    if (es_compatible) {
        res.status(200).json({
            message: `La versión ${parsed} es compatible`,
            verRecibida: parsed,
            requerido: process.env.MIN_RANGE,
        })
    }

    return res.status(426).json({
        error: `La version ${parsed} no es compatible con la aplicacion, necesita actualizacion`,
        apiVersion: process.env.APIVERSION,
        requerido: process.env.MIN_RANGE,
    })
});

async function iniciarServidor() {
    try {
        await conectarBD();
        app.listen(process.env.PORT, () => {
            console.log(`Backend escuchando en http://${process.env.HOST_NAME}:${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1);
    }
}




iniciarServidor();
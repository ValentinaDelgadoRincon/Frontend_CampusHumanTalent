import { conectarBD } from "./config/db.js";
import bcrypt from 'bcrypt';
import {
    AreaTrabajo,
    Cargo,
    Estado,
    Rol,
    TipoPregunta,
    TipoEncuesta,
    TipoRespuesta,
    Pregunta,
    Usuario,
    Encuesta,
    RespuestaEncuesta,
    CicloEvaluacion
} from "./validationSchemas.js";

async function seed() {
    try {
        await conectarBD();
        console.log("🌱 Iniciando seed de la base de datos...\n");

        // Limpiar colecciones
        await AreaTrabajo.deleteMany({});
        await Cargo.deleteMany({});
        await Estado.deleteMany({});
        await Rol.deleteMany({});
        await TipoPregunta.deleteMany({});
        await TipoEncuesta.deleteMany({});
        await TipoRespuesta.deleteMany({});
        await Pregunta.deleteMany({});
        await Usuario.deleteMany({});
        await Encuesta.deleteMany({});
        await RespuestaEncuesta.deleteMany({});
        await CicloEvaluacion.deleteMany({});

        const areas = await AreaTrabajo.insertMany([
            { nombre: "Academia" },
            { nombre: "Full Service" },
            { nombre: "Talent Up" },
            { nombre: "Teach Leep" },
            { nombre: "People and Talent" },
            { nombre: "Administración" },
            { nombre: "Campus Dev" },
            { nombre: "Marketing" },
            { nombre: "Red Campus" }
        ]);
        console.log(`✅ ${areas.length} áreas de trabajo creadas`);

        const cargos = await Cargo.insertMany([
            { nombre: "Desarrollador Junior" },
            { nombre: "Desarrollador Semi Senior" },
            { nombre: "Desarrollador Senior" },
            { nombre: "Líder de Proyecto" },
            { nombre: "Gerente de Área" },
            { nombre: "Director de Tecnología" }
        ]);
        console.log(`✅ ${cargos.length} cargos creados`);

        // 3. Insertar Estados
        const estados = await Estado.insertMany([
            { nombre: "Activo" },
            { nombre: "Inactivo" }
        ]);
        console.log(`✅ ${estados.length} estados creados`);

        // 4. Insertar Roles
        const roles = await Rol.insertMany([
            { nombre: "Administrador" },
            { nombre: "Empleado" }
        ]);
        console.log(`✅ ${roles.length} roles creados`);

        // 5. Insertar Tipos de Preguntas
        const tiposPreguntas = await TipoPregunta.insertMany([
            { nombre: "Actitud" },
            { nombre: "Aptitud" }
        ]);
        console.log(`✅ ${tiposPreguntas.length} tipos de preguntas creados`);

        // 6. Insertar Tipos de Encuestas
        const tiposEncuestas = await TipoEncuesta.insertMany([
            { nombre: "Autoevaluación", descripcion: "Encuesta para autoevaluarse" },
            { nombre: "Evaluación de Pares", descripcion: "Encuesta para evaluar a compañeros" },
            { nombre: "Evaluación de Supervisores", descripcion: "Encuesta para evaluar a supervisores" }
        ]);
        console.log(`✅ ${tiposEncuestas.length} tipos de encuestas creados`);

        // 7. Insertar Tipos de Respuestas
        const tiposRespuestas = await TipoRespuesta.insertMany([
            { nombre: "Si o No", descripcion: "Respuestas binarias de Sí o No" },
            { nombre: "Escala de Likert", descripcion: "Respuestas en una escala del 1 al 5" },
            { nombre: "Abierta", descripcion: "Respuestas abiertas y detalladas" }
        ]);
        console.log(`✅ ${tiposRespuestas.length} tipos de respuestas creados`);

        // 8. Insertar Preguntas (usando ObjectId de tipos)
        const preguntas = await Pregunta.insertMany([
            { pregunta: "¿Se comunica con claridad y respeto?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Construye relaciones de colaboración con otros?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Contribuye a un ambiente positivo y seguro?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Muestra empatía y consideración hacia los demás?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Gestiona las diferencias sin generar tensión innecesaria?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Maneja adecuadamente sus emociones en momentos retadores?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Aprende con rapidez y aplica lo aprendido?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Propone soluciones en lugar de enfocarse solo en el problema?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Busca apoyo cuando lo necesita?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Se adapta de manera flexible ante cambios o presión?", id_tipo_pregunta: tiposPreguntas[0]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Mantiene la confidencialidad cuando corresponde?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Toma decisiones éticas, incluso cuando son difíciles?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Respeta normas internas y acuerdos del equipo?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Es coherente entre lo que dice y lo que hace?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Actúa ante situaciones injustas o irregulares, promoviendo lo correcto?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Cumple con los compromisos y tiempos establecidos?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Propone ideas para mejorar procesos o resultados?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Toma iniciativa sin necesidad de recibir instrucciones para todo?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Trabaja con enfoque y autonomía?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id },
            { pregunta: "¿Mantiene un alto nivel de calidad en sus entregas?", id_tipo_pregunta: tiposPreguntas[1]._id, id_tipo_respuesta: tiposRespuestas[0]._id }
        ]);
        console.log(`✅ ${preguntas.length} preguntas creadas`);

        // 9. Hashear contraseña para usuarios
        const passwordHash = await bcrypt.hash("password123", 10);
        const test = await bcrypt.hash("test", 10);

        // 10. Insertar Usuarios (usando ObjectId de relaciones)
        const usuarios = await Usuario.insertMany([
            {
                nombre: "Yerick",
                apellido: "Lopez",
                email: "yerick.lopez@example.com",
                password: passwordHash,
                telefono: "1234567890",
                id_rol: roles[0]._id, // Administrador
                id_estado: estados[0]._id, // Activo
                id_area_trabajo: areas[0]._id, // Academia
                id_cargo: cargos[2]._id, // Desarrollador Senior
                sobremi: "Administrador del sistema",
                linkedIn: "https://www.linkedin.com/in/yericklopez"
            },
            {
                nombre: "Ana",
                apellido: "Gomez",
                email: "ana.gomez@example.com",
                password: passwordHash,
                telefono: "0987654321",
                id_rol: roles[1]._id, // Empleado
                id_estado: estados[0]._id, // Activo
                id_area_trabajo: areas[1]._id, // Full Service
                id_cargo: cargos[1]._id, // Desarrollador Semi Senior
                sobremi: "Empleado del sistema",
                linkedIn: "https://www.linkedin.com/in/anagomez"
            },
            {
                nombre: "Luis",
                apellido: "Martinez",
                email: "luis.martinez@example.com",
                password: passwordHash,
                telefono: "1122334455",
                id_rol: roles[1]._id, // Empleado
                id_estado: estados[1]._id, // Activo
                id_area_trabajo: areas[2]._id, // Talent Up
                id_cargo: cargos[0]._id, // Desarrollador Junior
                sobremi: "Empleado del sistema",
                linkedIn: "https://www.linkedin.com/in/luismartinez"
            },
            {
                nombre: "test",
                apellido: "test",
                email: "test@test.com",
                password: test,
                telefono: "1122334455",
                id_rol: roles[1]._id, // Empleado
                id_estado: estados[1]._id, // Activo
                id_area_trabajo: areas[2]._id, // Talent Up
                id_cargo: cargos[0]._id, // Desarrollador Junior
                sobremi: "test del sistema",
                linkedIn: "https://www.linkedin.com/in/test"
            }
        ]);
        console.log(`✅ ${usuarios.length} usuarios creados`);

        // 10. Insertar Encuesta
        const encuestas = await Encuesta.insertMany([
            {
                nombre: "Encuesta de Autoevaluación",
                descripcion: "Encuesta para la autoevaluación del primer trimestre",
                id_tipo_encuesta: tiposEncuestas[0]._id,
                id_preguntas: preguntas.map(p => p._id), // Todos los ObjectId de las preguntas
                fecha_creacion: new Date()
            },
            {
                nombre: "Encuesta de Evaluación de Pares",
                descripcion: "Encuesta para la evaluación de pares",
                id_tipo_encuesta: tiposEncuestas[1]._id,
                id_preguntas: preguntas.map(p => p._id), // Todos los ObjectId de las preguntas
                fecha_creacion: new Date()
            }
        ]);
        console.log(`✅ ${encuestas.length} encuesta(s) creada(s)`);


        const ciclosEvaluacion = await CicloEvaluacion.insertMany([
            {
                nombre: "Ciclo de Evaluación",
                descripcion: "Ciclo de evaluación correspondiente",
                encuesta_Id: encuestas[0]._id,
                fecha_inicio: new Date(new Date().setDate(new Date().getDate() - 30)), // Hace 30 días
                fecha_fin: new Date(new Date().setDate(new Date().getDate() + 30)), // Dentro de 30 días
                estado: "Abierto",
                creado_por: usuarios[0]._id // Yerick
            }
        ]);

        console.log(`✅ ${ciclosEvaluacion.length} ciclo(s) de evaluación creado(s)`);

        console.log("\n✨ Base de datos poblada exitosamente");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error al poblar la base de datos:", error);
        process.exit(1);
    }
}

seed();
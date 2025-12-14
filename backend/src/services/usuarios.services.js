import { Usuario } from "../validationSchemas.js";
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

function generarToken(id, id_rol){
    return jwt.sign({id, id_rol}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRES_TOKEN});
}

export async function obtenerUsuarios() {
    try {
        return await Usuario.find().sort({ nombre: 1 });
    } catch (error) {
        throw new Error("Error al obtener los usuarios: " + error.message);
    }
}

export async function obtenerUsuarioPorId(id) {
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        return usuario;
    } catch (error) {
        throw new Error("Error al obtener el usuario por ID: " + error.message);
    }
}

export async function crearUsuario(datosUsuario) {
    try {
        const { nombre, apellido, email, password, id_rol, id_estado, id_area_trabajo, id_cargo, telefono, sobremi, linkedIn } = datosUsuario;

        if (!nombre || nombre.trim() === '') {
            throw new Error("El nombre es obligatorio");
        }
        if (!apellido || apellido.trim() === '') {
            throw new Error("El apellido es obligatorio");
        }
        if (!email || email.trim() === '') {
            throw new Error("El email es obligatorio");
        }
        if (!password || password.trim() === '') {
            throw new Error("La contraseña es obligatoria");
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        if (!id_rol) {
            throw new Error("El rol es obligatorio");
        }

        const rolexistent = await mongoose.model('Rol').findById(id_rol);
        if (!rolexistent) {
            throw new Error("El rol no existe");
        }

        if (!id_estado) {
            throw new Error("El estado es obligatorio");
        }

        const estadoexistent = await mongoose.model('Estado').findById(id_estado);
        if (!estadoexistent) {
            throw new Error("El estado no existe");
        }

        if (!id_area_trabajo) {
            throw new Error("El área de trabajo es obligatoria");
        }

        const areatrabajoexistent = await mongoose.model('AreaTrabajo').findById(id_area_trabajo);
        if (!areatrabajoexistent) {
            throw new Error("El área de trabajo no existe");
        }
        
        if (!id_cargo) {
            throw new Error("El cargo es obligatorio");
        }

        const cargosexistent = await mongoose.model('Cargo').findById(id_cargo);
        if (!cargosexistent) {
            throw new Error("El cargo no existe");
        }

        const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
        if (usuarioExistente) {
            throw new Error("El email ya está registrado");
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = new Usuario({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.toLowerCase().trim(),
            password: passwordHash,
            telefono: telefono || '',
            id_rol,
            id_estado,
            id_area_trabajo,
            id_cargo,
            sobremi: sobremi || '',
            linkedIn: linkedIn || ''
        });

        const usuarioGuardado = await nuevoUsuario.save();

        const token = generarToken(usuarioGuardado._id, usuarioGuardado.id_rol);

        return {
            usuario: {
                _id: usuarioGuardado._id,
                nombre: usuarioGuardado.nombre,
                apellido: usuarioGuardado.apellido,
                email: usuarioGuardado.email,
                telefono: usuarioGuardado.telefono,
                id_rol: usuarioGuardado.id_rol,
                id_estado: usuarioGuardado.id_estado,
                id_area_trabajo: usuarioGuardado.id_area_trabajo,
                id_cargo: usuarioGuardado.id_cargo,
                sobremi: usuarioGuardado.sobremi,
                linkedIn: usuarioGuardado.linkedIn
            },
            token
        };
    } catch (error) {
        throw new Error("Error al crear el usuario: " + error.message);
    }
}

export async function eliminarUsuario(id) {
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        return await usuario.remove();
    } catch (error) {
        throw new Error("Error al eliminar el usuario: " + error.message);
    }
}

export async function editarUsuarioAdmin(id, datos) {
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        const { nombre, apellido, email, telefono, id_rol, id_estado, id_area_trabajo, id_cargo, sobremi, linkedIn } = datos;

        if (nombre !== undefined) usuario.nombre = nombre.trim();
        if (apellido !== undefined) usuario.apellido = apellido.trim();
        if (email !== undefined) {
            const emailExiste = await Usuario.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: id } 
            });
            if (emailExiste) {
                throw new Error("El email ya está registrado por otro usuario");
            }
            usuario.email = email.toLowerCase().trim();
        }
        if (telefono !== undefined) usuario.telefono = telefono;
        if (id_rol !== undefined) usuario.id_rol = id_rol;
        if (id_estado !== undefined) usuario.id_estado = id_estado;
        if (id_area_trabajo !== undefined) usuario.id_area_trabajo = id_area_trabajo;
        if (id_cargo !== undefined) usuario.id_cargo = id_cargo;
        if (sobremi !== undefined) usuario.sobremi = sobremi;
        if (linkedIn !== undefined) usuario.linkedIn = linkedIn;

        return await usuario.save();
    } catch (error) {
        throw new Error("Error al actualizar el usuario: " + error.message);
    }
}

export async function editarUsuarioPerfil(id, datos) {
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        
        const { telefono, sobremi, linkedIn } = datos;
        
        if (telefono !== undefined) usuario.telefono = telefono;
        if (sobremi !== undefined) usuario.sobremi = sobremi;
        if (linkedIn !== undefined) usuario.linkedIn = linkedIn;

        return await usuario.save();
    } catch (error) {
        throw new Error("Error al actualizar el perfil del usuario: " + error.message);
    }
}

export async function iniciarSesion(email, password) {
    try {
        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario) {
            throw new Error("Credenciales inválidas");
        }

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            throw new Error("Credenciales inválidas");
        }

        const token = generarToken(usuario._id);

        return {
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                id_rol: usuario.id_rol,
                id_estado: usuario.id_estado,
                id_area_trabajo: usuario.id_area_trabajo,
                id_cargo: usuario.id_cargo
            },
            token
        };
    } catch (error) {
        throw new Error("Error al iniciar sesión: " + error.message);
    }
}
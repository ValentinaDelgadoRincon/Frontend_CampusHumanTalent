import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URI;

export async function conectarBD() {
    try {
        await mongoose.connect(uri);
        console.log("✅ DB conectada con Mongoose");
    } catch (error) {
        console.error("❌ Error al conectar la BD:", error);
        process.exit(1);
    }
}

export default mongoose;


import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../dao/model/users.models.js';
import { hashPassword } from '../utils/encrypt.js';
import passport from 'passport';
import UserDTO from "../dtos/user.dto.js";
import userRepository from '../repositories/user.repository.js';
import { authenticateJWT } from "../middleware/auth.middleware.js";  // Importamos el middleware

const router = express.Router();

const createUser = async (req, res) => {
    
    try {
        const { first_name,last_name, email, password, age, role } = req.body;
    
        // Validar rol permitido
        const allowedRoles = ["admin", "user"];
        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ message: "Rol no valido. Asegurese de que rol sea admin o user." });
        }
    
        // Verificar si ya existe el usuario
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "El usuario ya existe" });
        }
    
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Crear nuevo usuario
        const newUser = {
          first_name,
          last_name,
          email,
          age,
          password: hashedPassword,
          cart:null,
          role,  // Solo se permite "admin" o "user"
        };
    
        const createdUser = await userRepository.createUser(newUser);
    
        res.status(201).json({ message: "Usuario registrado", user: createdUser });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }

}

router.post('/register', createUser);

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Mail o contraseña no validos' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Mail o contraseña no validos' });
    }

    const payload = { id: user._id, email: user.email, role:user.role };
    const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });



    res.json({ message:"Hola " + user.first_name , token });
    
});

router.get("/current", authenticateJWT, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    // Usar el DTO para enviar solo los datos necesarios del usuario
    const userDTO = new UserDTO(req.user);
    res.json({message:"Autenticado correctamente",userDTO});
  });
  

export default router;

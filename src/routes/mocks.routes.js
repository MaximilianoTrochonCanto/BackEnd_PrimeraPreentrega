import { Router } from 'express';
import generateMockUsers from '../utils/mockUsers.js';
import UserModel from '../dao/model/users.models.js'; // Ajustar el modelo según tu estructura
import PetModel from '../dao/model/pets.models.js'; // Ajustar el modelo según tu estructura
import generateMockPets from '../utils/mockPets.js';
const router = Router();

// Endpoint GET /mockingpets
router.get('/mockingpets', (req, res) => {
    const pets = generateMockPets();
    res.status(200).json(pets);
});

// Endpoint GET /mockingusers
router.get('/mockingusers', (req, res) => {
    const users = generateMockUsers();
    res.status(200).json(users);
});

// Endpoint POST /generateData
router.post('/generateData', async (req, res) => {
    try {
        const { users = 0, pets = 0 } = req.body;

        // Generar usuarios mock
        const mockUsers = generateMockUsers(users);
        await UserModel.insertMany(mockUsers);

        // Generar pets mock
        const mockPets = Array.from({ length: pets }, (_, i) => ({
            _id: `mock-pet-id-${i}`,
            name: `Pet${i}`,
            species: 'Unknown',
        }));
        await PetModel.insertMany(mockPets);

        res.status(201).json({ message: 'Data generated successfully', users: users, pets: pets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

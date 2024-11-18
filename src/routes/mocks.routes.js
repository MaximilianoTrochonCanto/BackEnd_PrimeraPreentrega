import { Router } from 'express';
import generateMockUsers from '../utils/mockUsers.js';
import generateMockPets from '../utils/mockPets.js';
import UserModel from '../dao/model/users.models.js'; 
import PetModel from '../dao/model/pets.models.js'; 

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
        const { users,pets } = req.body;

        // Generar usuarios mock
        const mockUsers = generateMockUsers(users);
        await UserModel.insertMany(mockUsers);

        // Generar pets mock
        const mockPets = generateMockPets(pets)
        await PetModel.insertMany(mockPets);

        res.status(201).json({ message: 'Data generated successfully', users, pets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

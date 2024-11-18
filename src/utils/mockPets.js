const generateMockPets = (count = 50) => {
    const speciesList = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster'];
    const pets = [];

    for (let i = 0; i < count; i++) {
        pets.push({
            name: `Pet${i}`,
            species: speciesList[Math.floor(Math.random() * speciesList.length)],
            age: Math.floor(Math.random() * 15), // Edad aleatoria entre 0 y 14 años
        });
    }

    return pets;
};

export default generateMockPets;

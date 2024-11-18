const generateMockUsers = (count = 50) => {
    const roles = ['user', 'admin'];
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push({            
            first_name: `John`,
            last_name: `Doe ${i}`,
            email: `user${i}@gmail.com`,
            age: Math.floor(Math.random() * 95), // Edad aleatoria entre 0 y 14 años
            password: 'coder123',       
            cart:null,     
            role: roles[Math.floor(Math.random() * roles.length)],
            pets: []
        });
    }

    return users;
};

export default generateMockUsers;

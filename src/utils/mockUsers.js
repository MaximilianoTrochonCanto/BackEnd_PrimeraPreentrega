const generateMockUsers = (count = 50) => {
    const roles = ['user', 'admin'];
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push({
            _id: `mock-id-${i}`,
            username: `user${i}`,
            password: 'coder123',
            role: roles[Math.floor(Math.random() * roles.length)],
            pets: []
        });
    }

    return users;
};

export default generateMockUsers;

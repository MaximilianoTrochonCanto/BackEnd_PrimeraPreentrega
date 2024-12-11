import UserDAO from "../dao/daos/user.dao.js";

class UserRepository {
    async findByEmail(email) {
        return await UserDAO.findByEmail(email);
    }

    async createUser(user) {
        return await UserDAO.createUser(user);
    }

    async findById(id) {
        return await UserDAO.findById(id);
    }

    async updateUser(id, updateData) {
        return await UserDAO.updateUser(id, updateData);
    }

    async deleteUser(id) {
        return await UserDAO.deleteUser(id);
    }

    async findAll(filter = {}, options = {}) {
        return await UserDAO.findAll(filter, options);
    }
}

export default new UserRepository();

import UserDAO from "../dao/daos/user.dao.js";


class UserRepository{
        async findByEmail(email){
            return await UserDAO.findByEmail(email);
        }

        async createUser(user){
            return await UserDAO.createUser(user)
        }
}

export default new UserRepository();
import User from "../model/users.models.js";

class UserDAO {
  async findByEmail(email) {
    return await User.findOne({email});
  }

  async createUser(user) {
    return await User.create(user);
  }
}

export default new UserDAO();

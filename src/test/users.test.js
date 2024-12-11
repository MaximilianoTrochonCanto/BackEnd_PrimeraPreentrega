import supertest from "supertest";
import app from "../app.js";
import User from "../dao/model/users.models.js";

describe("POST /auth/login", () => {
    test("should return 200 for valid email and password", async () => {
        const response = await supertest(app).post("/auth/login").send({
            email: "test1@gmail.com",
            password: "Test1Test",
        });
        expect(response.statusCode).toBe(200);
    });

    test("should return 401 for missing email and password", async () => {
        const response = await supertest(app).post("/auth/login").send({
            email: "",
            password: "",
        });
        expect(response.statusCode).toBe(401);
    });
});

const validUser = {
    first_name: "Test",
    last_name: "Dude",
    email: "test23@gmail.com",
    password: "Test23Test",
    age:29,
    cart: null,
    role: "user",
};

describe("POST /auth/register", () => {
    afterEach(async () => {
        // Delete the user after each test (you could add more checks to make sure it's the test user)
        await User.deleteOne({ email: validUser.email });
    });

    test("should return 400 for already existent user with a different email", async () => {
        // Change the email to test duplicate entry logic
        const duplicateUser = { ...validUser, email: "user2@gmail.com" };
        const response = await supertest(app).post("/auth/register").send(duplicateUser);
        expect(response.statusCode).toBe(400);
    });

    test("should return 200 for successful user creation", async () => {
        const response = await supertest(app).post("/auth/register").send(validUser);
        expect(response.statusCode).toBe(200);
        
    });

    test("should return 500 for missing email and password", async () => {
        const response = await supertest(app).post("/auth/register").send({
            email: "",
            password: "",
        });
        expect(response.statusCode).toBe(500);
    });
});

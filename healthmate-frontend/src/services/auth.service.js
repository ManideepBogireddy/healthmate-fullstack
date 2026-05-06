import api from "./api";

const register = (username, email, password, age, height, weight, activityLevel, healthGoal) => {
    return api.post("/auth/signup", {
        username,
        email,
        password,
        age: parseInt(age, 10),
        height: parseFloat(height),
        weight: parseFloat(weight),
        activityLevel,
        healthGoal,
    });
};

const login = (username, password) => {
    return api
        .post("/auth/signin", {
            username,
            password,
        })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
                localStorage.setItem("token", response.data.token);
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const checkUsername = (username) => {
    return api.get(`/auth/check-username?username=${username}`);
};

const checkEmail = (email) => {
    return api.get(`/auth/check-email?email=${email}`);
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
    checkUsername,
    checkEmail,
};

export default AuthService;

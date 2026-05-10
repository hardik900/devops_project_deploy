// api.js

import axios from "axios";

// Base URL
const API = axios.create({
    baseURL: "http://localhost:5000",
});

// GET API
export const getUsers = async () => {
    try {
        const response = await API.get("/api/users");
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

// POST API
export const createUser = async (userData) => {
    try {
        const response = await API.post("/api/users", userData);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};
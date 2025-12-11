"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-demo';
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-demo';
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const generateRefreshToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-demo';
    const options = {
        expiresIn: '30d'
    };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;

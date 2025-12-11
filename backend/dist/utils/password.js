"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    // More user-friendly validation - just require at least one letter and one number
    if (!/(?=.*[a-zA-Z])/.test(password)) {
        errors.push('Password must contain at least one letter');
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePassword = validatePassword;

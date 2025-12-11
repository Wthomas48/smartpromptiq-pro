"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    res.status(404).json({
        success: false,
        message: error.message
    });
};
exports.notFound = notFound;

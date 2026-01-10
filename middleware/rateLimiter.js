import rateLimit from 'express-rate-limit'

// General limiting
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

//strict limit
export const strictLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 min
    max: 5,
    message: "Security alert: Too many attempts from this IP.",
    standardHeaders: true,
    legacyHeaders: false,
});

 
import jwt, {} from "jsonwebtoken";
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not configured");
    return secret;
};
export const requireAuth = (roles) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith("Bearer ")) {
                res.status(401).json({ message: "Missing or invalid authorization header" });
                return;
            }
            const token = authHeader.slice(7).trim();
            if (!token) {
                res.status(401).json({ message: "Missing bearer token" });
                return;
            }
            const decoded = jwt.verify(token, getJwtSecret());
            if (!decoded.id || !decoded.role) {
                res.status(401).json({ message: "Invalid token payload" });
                return;
            }
            if (roles?.length && !roles.includes(decoded.role)) {
                res.status(403).json({ message: "Forbidden" });
                return;
            }
            req.user = { id: decoded.id, role: decoded.role };
            next();
        }
        catch {
            res.status(401).json({ message: "Invalid or expired token" });
        }
    };
};
//# sourceMappingURL=auth.middleware.js.map
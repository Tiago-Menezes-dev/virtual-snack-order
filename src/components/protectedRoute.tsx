import { Navigate } from "react-router-dom";

export function ProtectedRoute({children, user}) {
    return user ? children : <Navigate to="/" />
}

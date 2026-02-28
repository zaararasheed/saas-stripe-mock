// client/src/pages/login.tsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            navigate("/dashboard");
        } catch (err: any) {
            alert("Login failed: " + (err?.message ?? err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/dashboard");
        } catch (err: any) {
            alert("Google sign-in failed: " + (err?.message ?? err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page login-page">
            <div className="login-card card">
                <h2>Sign in</h2>
                <form onSubmit={handleLogin}>
                    <label>
                        <div className="label">Email</div>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>
                    <label>
                        <div className="label">Password</div>
                        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                    </label>
                    <div className="form-actions">
                        <button className="btn primary" type="submit" disabled={loading}>{loading ? "..." : "Sign in"}</button>
                    </div>
                </form>
                <div style={{ marginTop: 12 }}>
                    <button className="btn" onClick={handleGoogle} disabled={loading}>Continue with Google</button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <a href="/signup" className="muted">Don't have an account? Sign up</a>
                </div>
            </div>
        </div>
    );
};

export default Login;

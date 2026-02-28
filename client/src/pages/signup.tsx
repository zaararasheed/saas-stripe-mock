import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase-config";
import { useNavigate } from "react-router-dom";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          pass
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        subscribed: false,
        subscriptionStatus: "none",
        plan: "free",
        cancelAtPeriodEnd: false,
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err: any) {
      alert("Signup failed: " + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="page login-page">
        <div className="login-card card">
          <h2>Create account</h2>
          <form onSubmit={handleSignup}>
            <label>
              <div className="label">Email</div>
              <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              <div className="label">Password</div>
              <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
              />
            </label>

            <div className="form-actions">
              <button
                  className="btn primary"
                  type="submit"
                  disabled={loading}
              >
                {loading ? "..." : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Signup;
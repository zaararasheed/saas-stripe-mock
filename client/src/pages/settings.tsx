import React, { useState } from "react";

const Settings: React.FC = () => {
    const [email, setEmail] = useState("zaara@example.com");
    const [billingEmail, setBillingEmail] = useState("billing@example.com");

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // placeholder — would save via API
        alert("Saved (mock): " + email + " / " + billingEmail);
    };

    return (
        <div className="page settings-page">
            <h1>Settings</h1>
            <form className="card form-card" onSubmit={handleSave}>
                <label>
                    <div className="label">Display Email</div>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label>
                    <div className="label">Billing Email</div>
                    <input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
                </label>

                <div className="form-actions">
                    <button className="btn" type="submit">Save</button>
                    <button className="btn danger" type="button" onClick={() => alert("Account deleted (mock)")}>
                        Delete account
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;

import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Layout from "./components/layout";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Settings from "./pages/settings";
import Subscription from "./pages/subscription";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import RequireSubscription from "./components/RequireSubscription";
import RequirePlan from "./components/RequirePlan";

import { AuthProvider } from "./firebase/AuthProvider";

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/signup"
                        element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        }
                    />

                    {/* Subscription page (must be logged in) */}
                    <Route
                        path="/subscription"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Subscription />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Dashboard (any subscribed user) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <RequireSubscription>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </RequireSubscription>
                            </ProtectedRoute>
                        }
                    />

                    {/* Settings (PRO only) */}
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <RequirePlan requiredPlan="pro">
                                    <Layout>
                                        <Settings />
                                    </Layout>
                                </RequirePlan>
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
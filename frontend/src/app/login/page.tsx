"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isLogin) {
                // FastAPI OAuth2 requires form data
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                const response = await fetchWithAuth("/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData.toString(),
                });

                localStorage.setItem("access_token", response.access_token);
                router.push("/dashboard");
            } else {
                await fetchWithAuth("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                });

                // Auto login on successful register
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);
                const loginResp = await fetchWithAuth("/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData.toString()
                });
                localStorage.setItem("access_token", loginResp.access_token);
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="card w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center mb-6">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-2">
                        {isLogin ? "Sign In" : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-secondary-foreground">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline font-medium"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}

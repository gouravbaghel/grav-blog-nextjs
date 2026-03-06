// Newsletter subscription component with API integration
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("You're subscribed! 🎉");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    };

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white" />
            </div>

            <div className="relative z-10 max-w-xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        Stay in the loop
                    </h3>
                    <p className="text-violet-100 mb-6">
                        Get the latest articles, tutorials, and updates delivered straight to your inbox.
                        No spam, unsubscribe at any time.
                    </p>

                    {status === "success" ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center justify-center gap-2 text-white"
                        >
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">{message}</span>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/20 border-white/30 text-white placeholder:text-violet-200 focus-visible:ring-white"
                                required
                            />
                            <Button
                                type="submit"
                                disabled={status === "loading"}
                                className="bg-white text-violet-700 hover:bg-violet-50 font-semibold shrink-0"
                            >
                                {status === "loading" ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Subscribe <Send className="h-4 w-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {status === "error" && (
                        <p className="text-red-200 text-sm mt-3">{message}</p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

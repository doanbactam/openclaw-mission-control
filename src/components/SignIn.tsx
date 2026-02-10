import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function SignInForm() {
	const { signIn } = useAuthActions();
	const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const inputCls = "w-full bg-secondary text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)]/30 outline-none placeholder:text-muted-foreground/40";

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
			<div className="w-full max-w-sm">
				{/* Brand */}
				<div className="text-center mb-8">
					<span className="text-2xl text-[var(--accent-blue)] block mb-3">◇</span>
					<h1
						className="text-base font-semibold text-foreground uppercase"
						style={{ letterSpacing: "0.15em" }}
					>
						Mission Control
					</h1>
					<p className="mt-1.5 text-xs text-muted-foreground">
						{flow === "signIn" ? "Welcome back." : "Create your account."}
					</p>
				</div>

				{/* Form */}
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						setIsLoading(true);
						const formData = new FormData(e.target as HTMLFormElement);
						formData.set("flow", flow);
						void signIn("password", formData)
							.then((result) => {
								if (result?.signedIn === null) {
									setError("Invalid credentials. Try 'Create Account' if new.");
								}
							})
							.catch((error) => {
								if (error.message === "InvalidAccountId") {
									setError("Account not found.");
								} else {
									setError(error.message);
								}
							})
							.finally(() => setIsLoading(false));
					}}
				>
					<div className="space-y-3">
						<div>
							<label
								className="text-[10px] font-medium uppercase text-muted-foreground mb-1.5 block"
								style={{ letterSpacing: "0.08em" }}
								htmlFor="email"
							>
								Email
							</label>
							<input
								id="email"
								className={inputCls}
								type="email"
								name="email"
								placeholder="you@example.com"
								required
								style={{ transition: "var(--transition-fast)" }}
							/>
						</div>
						<div>
							<label
								className="text-[10px] font-medium uppercase text-muted-foreground mb-1.5 block"
								style={{ letterSpacing: "0.08em" }}
								htmlFor="password"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									className={inputCls}
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="••••••••"
									required
									style={{ transition: "var(--transition-fast)" }}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
									style={{ transition: "var(--transition-fast)" }}
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>
					</div>

					<button
						className="w-full bg-foreground text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 active:scale-[0.99] uppercase text-xs cursor-pointer disabled:opacity-50"
						style={{ letterSpacing: "0.12em", transition: "var(--transition-fast)" }}
						type="submit"
						disabled={isLoading}
					>
						{isLoading
							? "..."
							: flow === "signIn"
								? "Sign In"
								: "Create Account"}
					</button>

					<div className="text-center">
						<button
							type="button"
							className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
							style={{ transition: "var(--transition-fast)" }}
							onClick={() => {
								setFlow(flow === "signIn" ? "signUp" : "signIn");
								setError(null);
							}}
						>
							{flow === "signIn"
								? "Don't have an account?"
								: "Already have an account?"}
						</button>
					</div>

					{error && (
						<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
							<span className="text-destructive text-xs">✕</span>
							<p className="text-foreground/70 text-xs leading-relaxed">{error}</p>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}

export default SignInForm;

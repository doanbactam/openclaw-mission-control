import { useAuthActions } from "@convex-dev/auth/react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";

function SignInForm() {
	const { signIn } = useAuthActions();
	const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
			<div className="w-full max-w-sm">
				{/* Brand */}
				<div className="text-center mb-8">
					<span className="text-2xl text-[var(--accent-orange)] block mb-3">◇</span>
					<h1 className="text-lg font-semibold tracking-[0.2em] text-foreground uppercase">
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
								className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block"
								htmlFor="email"
							>
								Email
							</label>
							<input
								id="email"
								className="w-full bg-card text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 outline-none transition-all placeholder:text-muted-foreground/40"
								type="email"
								name="email"
								placeholder="you@example.com"
								required
							/>
						</div>
						<div>
							<label
								className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 block"
								htmlFor="password"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									className="w-full bg-card text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-[var(--accent-orange)] focus:ring-1 focus:ring-[var(--accent-orange)]/30 outline-none transition-all placeholder:text-muted-foreground/40"
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
								>
									{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
								</button>
							</div>
						</div>
					</div>

					<button
						className="w-full bg-foreground text-background font-semibold py-2.5 px-4 rounded-lg hover:bg-foreground/90 active:scale-[0.99] transition-all uppercase tracking-[0.15em] text-xs cursor-pointer disabled:opacity-50"
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
							className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

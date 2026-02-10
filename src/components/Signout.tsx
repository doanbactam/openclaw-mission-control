import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

function SignOutButton() {
	const { isAuthenticated } = useConvexAuth();
	const { signOut } = useAuthActions();
	return (
		<>
			{isAuthenticated && (
				<button
					className="text-[10px] font-medium text-muted-foreground hover:text-foreground tracking-wider transition-colors cursor-pointer"
					onClick={() => void signOut()}
				>
					LOGOUT
				</button>
			)}
		</>
	);
}

export default SignOutButton;

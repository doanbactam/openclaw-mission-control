import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const passwordProvider = Password();
const originalAuthorize = passwordProvider.authorize;

passwordProvider.authorize = async (params, ctx) => {
	try {
		return await originalAuthorize(params, ctx);
	} catch (error: any) {
		if (error.message === "InvalidAccountId") {
			return null;
		}
		throw error;
	}
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [passwordProvider],
});

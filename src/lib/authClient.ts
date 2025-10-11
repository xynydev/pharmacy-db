import { createAuthClient } from 'better-auth/client';
import { passkeyClient, anonymousClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [passkeyClient(), anonymousClient()]
});

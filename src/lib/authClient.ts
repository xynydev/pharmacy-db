import { createAuthClient } from 'better-auth/client';
import { passkeyClient, anonymousClient, inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [
		passkeyClient(),
		anonymousClient(),
		inferAdditionalFields({
			user: {
				role: {
					type: 'string',
					required: false,
					defaultValue: 'user',
					input: false
				}
			}
		})
	]
});

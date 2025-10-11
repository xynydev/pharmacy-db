import { getAuth } from '$lib/server/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
	const auth = getAuth(event.platform);

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (!session && event.url.pathname !== '/login' && !event.url.pathname.startsWith('/api/auth')) {
		redirect(307, '/login');
	}
	return svelteKitHandler({ event, resolve, auth, building });
}

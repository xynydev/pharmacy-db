import { getAuth } from '$lib/server/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

async function authHandler({ event, resolve }) {
	const auth = getAuth(event.platform);

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	if (!session && event.url.pathname !== '/login' && !event.url.pathname.startsWith('/api/auth')) {
		redirect(307, '/login');
	}
	return svelteKitHandler({ event, resolve, auth, building });
}

async function headerHandler({ event, resolve }) {
	const response = await resolve(event);

	response.headers.set('Content-Security-Policy', "default-src 'self'");
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Permissions-Policy', 'geolocation=(self)');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Cache-Control', 'private');
	response.headers.set('Referrer-Policy', 'no-referrer');

	return response;
}

export const handle = sequence(authHandler);

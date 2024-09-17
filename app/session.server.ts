import { createCookieSessionStorage } from '@remix-run/node'

if(!process.env.SESSION_SECRET) {
    	throw new Error('SESSION_SECRET must be defined')
}

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'sda_member_session',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
})

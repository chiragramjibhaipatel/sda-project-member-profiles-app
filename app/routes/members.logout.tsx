import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { sessionStorage } from '~/session.server'

export async function loader({ request }: ActionFunctionArgs) {
    const cookieSession = await sessionStorage.getSession(
        request.headers.get('cookie'),
    )
    return redirect('/members/login', {
        headers: {
            'set-cookie': await sessionStorage.destroySession(cookieSession),
        },
    })
}
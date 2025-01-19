import { Button, Card, FormLayout, InlineError, Layout, Page, TextField } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { HideIcon, ViewIcon } from "@shopify/polaris-icons";
import React, { useState } from "react";
import z from "zod";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { unauthenticated } from "~/shopify.server";
import { validateLogin } from "~/utils/utils.server";
import { sessionStorage } from "~/session.server";
import { useIsPending } from "~/utils/misc";
import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { checkHoneypot } from "~/utils/honeypot.server";

const LoginForm = z.object({
	username: z.string().min(1),
	password: z.string().min(1)
});

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	checkHoneypot(formData);
	const { admin } = await unauthenticated.admin(process.env.SHOP);

	const submission = await parseWithZod(formData, {
		schema: () =>
			LoginForm.transform(async (data, ctx) => {
				const { username, password } = data;
				const { isValidLogin, handle, needReset } = await validateLogin({ admin, username, password });
				if (!isValidLogin) {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid username or password',
					})
					return z.NEVER
				}
				return { ...data, handle, needReset }
			}),
		async: true
	});
	if (submission.status !== 'success') {
		return json(submission.reply());
	}

	const cookieSession = await sessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const { handle, needReset } = submission.value;
	cookieSession.set('handle', handle);
	if (needReset) {
		return redirect(`/members/${handle}/reset-password`, { headers: { 'Set-Cookie': await sessionStorage.commitSession(cookieSession) } });
	} 
	return redirect(`/members/${handle}`, { headers: { 'Set-Cookie': await sessionStorage.commitSession(cookieSession) } });
}

export default function MembersLogin() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'login-form',
		lastResult: actionData,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginForm })
		},
		shouldRevalidate: 'onBlur',
	});

	const username = useInputControl(fields.username);
	const password = useInputControl(fields.password);

	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	return (
		<Page fullWidth={false}>
			<Form method={"POST"} {...getFormProps(form)} onSubmit={form.onSubmit}>
				<HoneypotInputs />
				<Layout>
					<Layout.Section variant={"oneHalf"}>
						<Card>
							<FormLayout>
								<TextField label={"Username"}
									value={username.value}
									autoComplete={"off"}
									onChange={username.change}
									error={fields.username.errors} />
								<TextField label={"Password"} value={password.value} autoComplete={"off"} requiredIndicator={true} onChange={password.change} error={fields.password.errors}
									type={isPasswordVisible ? "text" : "password"}
									connectedRight={<Button icon={isPasswordVisible ? HideIcon : ViewIcon} onClick={() => setIsPasswordVisible(prevState => !prevState)} />}
								/>
								<Button loading={isPending} submit variant={"primary"}>Login</Button>
								<InlineError message={form.errors?.join("-") || ""} fieldID={form.id} />
							</FormLayout>
						</Card>
					</Layout.Section>
				</Layout>
			</Form>
		</Page>
	);
}


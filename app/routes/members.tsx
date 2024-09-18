import {AppProvider} from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import {Outlet, useLoaderData} from "@remix-run/react";
import {honeypot} from "~/utils/honeypot.server";
import {json} from "@remix-run/node";
import {HoneypotProvider} from "remix-utils/honeypot/react";

export const loader = async () => {
    const honeyProps = honeypot.getInputProps ()
    return json ({honeyProps})
}

export default function Members () {
    const {honeyProps} = useLoaderData<typeof loader> ();
    return (
	<HoneypotProvider {...honeyProps}>
	    <AppProvider i18n={en}>
		<Outlet/>
	    </AppProvider>
	</HoneypotProvider>
    )
}

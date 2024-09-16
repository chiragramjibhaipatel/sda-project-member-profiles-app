import {AppProvider} from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import {Outlet} from "@remix-run/react";

export default function Members(){
    return(
	<AppProvider i18n={en}>
	    <Outlet />
	</AppProvider>
    )
}

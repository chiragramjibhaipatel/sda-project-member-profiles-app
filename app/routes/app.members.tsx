import {Outlet} from "@remix-run/react";
import {Page} from "@shopify/polaris";

export default function Members() {
  return (
    <Page>
	<Outlet />
    </Page>
  );
}

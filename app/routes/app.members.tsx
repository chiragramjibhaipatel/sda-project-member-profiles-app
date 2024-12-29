import {Outlet} from "@remix-run/react";
import {Page} from "@shopify/polaris";

export const loader = async () => {
  console.log("Members loader");
  return {props: {}};
}

export default function Members() {
  return (
    <Page>
	<Outlet />
    </Page>
  );
}

import { Form } from "@remix-run/react";
import { Button } from "@shopify/polaris";
import React from "react";

export function LogoutForm() {
  return (
    <Form method={"POST"} action={"/members/logout"}>
      <Button submit variant={"primary"}>
        Logout
      </Button>
    </Form>
  );
}

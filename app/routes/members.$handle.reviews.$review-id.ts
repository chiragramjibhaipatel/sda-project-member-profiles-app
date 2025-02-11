import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { unauthenticated } from "~/shopify.server";
import { ReviewSchema } from "~/zodschema/MemberProfileSchema";
import { sessionStorage } from "~/session.server";


export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { handle } = params;
    invariant(handle, "Handle is required");
    const cookieSession = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    const handleInCookie = cookieSession.get("handle");
    if (!handleInCookie || handleInCookie !== handle) {
      return redirect("/members/login", {
        headers: {
          "Set-Cookie": await sessionStorage.destroySession(cookieSession),
        },
      });
    }
    const { admin } = await unauthenticated.admin(process.env.SHOP);
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: ReviewSchema });
    if (submission.status !== "success") {
        return json(submission.reply(), { status: 400 });
    }
    const { reference, reviewer, link } = submission.value;
    const reviewId = params["review-id"];
    console.log("Review ID:", reviewId);
    console.log("Reference:", reference);
    console.log("Reviewer:", reviewer);
    console.log("Link:", link);

    return {}
}
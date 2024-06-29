import { json } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();
  const delay = data["delay"];
  const requestId = data["delay"];
  console.log(`[+] /job(${requestId}): called`);
  if (typeof delay !== "string") {
    return json({ error: "invalid request" }, { status: 401 });
  }
  console.log(
    `[+] /job(${requestId}, ${new Date().toLocaleTimeString()}): job start... delay: ${delay} msecs`
  );
  await new Promise((resolve) => setTimeout(resolve, parseInt(delay)));
  console.log(`[+] /job(${requestId}): job end`);
  return json({ message: "ok", requestId });
}

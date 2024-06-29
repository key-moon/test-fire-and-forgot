import { json } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const requstId = Math.ceil(Math.random() * 10000)
    .toString()
    .padStart(5, "0");

  console.log(`[+] /?index(${requstId}): called`);

  const data = await request.formData();
  console.log(data);
  const delay = data.get("delay");
  const callerDelay = data.get("caller-delay");
  const fireAndForgot = data.get("fire-and-forgot") === "on";

  if (typeof delay !== "string" || typeof callerDelay !== "string") {
    return json({ error: "invalid request" }, { status: 401 });
  }

  // ↓ 普通に SSRF を起こすので、やめよう
  const requestTo = request.headers.get("origin") + "/job";

  const promise = fetch(requestTo, {
    method: "POST",
    body: JSON.stringify({ delay }),
  })
    .then((response) => response.text())
    .then((response) => console.log(`[+] /?index: response: ${response}`));
  console.log(`[+] /?index(${requstId}): request sent to ${requestTo}`);
  console.log(`[+] /?index(${requstId}): delay: ${callerDelay} msecs...`);
  await new Promise((resolve) => setTimeout(resolve, parseInt(callerDelay)));
  console.log(`[+] /?index(${requstId}): over`);
  if (!fireAndForgot) {
    console.log(`[+] /?index(${requstId}): waiting promise...`);
    await promise;
  }
  console.log(`[+] /?index(${requstId}): return response`);
  return json({ message: "ok" });
}

export default function App() {
  return (
    <form method="post" action="?index">
      <div>
        <label htmlFor="delay">Delay:</label>
        <input
          type="number"
          name="delay"
          placeholder="delay"
          defaultValue="2000"
        />
      </div>
      <div>
        <label htmlFor="delay">Caller Delay:</label>
        <input
          type="number"
          name="caller-delay"
          placeholder="caller-delay"
          defaultValue="1000"
        />
      </div>
      <div>
        <label htmlFor="fire-and-forgot">Fire and Forget:</label>
        <input type="checkbox" name="fire-and-forgot" />
      </div>
      <button type="submit">submit</button>
    </form>
  );
}

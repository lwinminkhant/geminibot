/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
//   async fetch(request, env, ctx) {
//     return new Response('Hello World!');
//   },
// };
// export default {
//   async fetch(request, env, ctx) {
//       if(request.method === "POST"){
// const payload = await request.json();
//           if('message' in payload){
//   const chatId = payload.message.chat.id;
//   const input = String(payload.message.text);
//   const user_firstname = String(payload.message.from.first_name);
//   const response = user_firstname + " said " + input;
//               await this.sendMessage(env.API_KEY, chatId, response);
//           }
//       }
//       return new Response('OK');
//   },

//   async sendMessage(apiKey, chatId, text){
// const url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${text}`;
// const data = await fetch(url).then(resp => resp.json());
//   }
// };
const telegramAuthToken = `6695419732:AAH1N5TqyS545znJ-q-JB5q7arbaYUkYVOM`;
const webhookEndpoint = '/endpoint';
const channelId = '@aitist';
addEventListener('fetch', (event) => {
	event.respondWith(handleIncomingRequest(event));
});

async function handleIncomingRequest(event) {
	let url = new URL(event.request.url);
	let path = url.pathname;
	let method = event.request.method;
	let workerUrl = `${url.protocol}//${url.host}`;

	if (method === 'POST' && path === webhookEndpoint) {
		const update = await event.request.json();
		event.waitUntil(processUpdate(update));
		return new Response('Ok');
	} else if (method === 'GET' && path === '/configure-webhook') {
		const url = `https://api.telegram.org/bot${telegramAuthToken}/setWebhook?url=${workerUrl}${webhookEndpoint}`;

		const response = await fetch(url);

		if (response.ok) {
			return new Response('Webhook set successfully', { status: 200 });
		} else {
			return new Response('Failed to set webhook', { status: response.status });
		}
	} else {
		return new Response('Not found', { status: 404 });
	}
}

async function processUpdate(update) {
	if ('message' in update) {
		const chatId = update.message.chat.id;
		const userText = update.message.text;

		const responseText = `Forward message to${channelId} ${userText}`;

		const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${channelId}&text=${encodeURIComponent(
			responseText
		)}`;

		await fetch(url);
	}
}

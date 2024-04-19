/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Navigate to the new directory cd geminibot
│ Run the development server npm run start
│ Deploy your application npm run deploy
│ Read the documentation https://developers.cloudflare.com/workers
│ Stuck? Join us at https://discord.gg/cloudflaredev

 * Learn more at https://developers.cloudflare.com/workers/
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const telegramAuthToken = `6695419732:AAH1N5TqyS545znJ-q-JB5q7arbaYUkYVOM`;
const channelId = '@aicist';

const webhookEndpoint = '/endpoint';
const apiKey = 'AIzaSyDK99WvXizXnPpVeOJsgR5FaROJaeWFD8Y';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
		const prompt = userText;
		const responseText = 'Your prompt is : ' + prompt;
		console.log('update: ', update);
		//const clientIPAddress = event.request.headers.get('cf-connecting-ip');
		// const ip = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
		// 	'Update : ' + update
		// )}`;
		// await fetch(ip);
		//write square function

		try {
			const result = await model.generateContent(prompt);
			const responseText = await result.response.text();

			const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}`;
			await fetch(url);
		} catch (error) {
			//console.error('Error sending message:', error);
			const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(error)}`;
			await fetch(url);
		}
		const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}`;
		await fetch(url);
		return new Response(responseText);
	}
}

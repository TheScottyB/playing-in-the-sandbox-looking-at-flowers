import fs from "node:fs";
import path from "node:path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
	console.error("GEMINI_API_KEY is required");
	process.exit(1);
}

const model = "gemini-2.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const filePath = path.join(
	process.cwd(),
	"app_store_assets/screenshots/iphone61.png",
);
const buffer = fs.readFileSync(filePath);
const base64Image = buffer.toString("base64");

const prompt = `Analyze this App Store screenshot. Check if there are any of the following issues:
1. Is it a screenshot of the mobile home screen (iOS Springboard or Android Launcher/App Drawer) instead of the app?
2. Is it showing the Expo Go client, developer launcher, Metro bundler connection screen, or other developer menus?
3. Does it contain any debug overlays, redbox error screens, FPS meters, or a visible "DEBUG" ribbon?
4. Does it contain any visible popups, modal overlays, permission dialogs (e.g. location permission alert), or system alert dialogs that shouldn't be in a clean production screenshot?
5. Does the status bar show a time other than 9:41?

Respond ONLY with a JSON object in this exact format:
{
  "isHomeScreen": true,
  "isDevLauncher": true,
  "hasDebugOverlay": true,
  "hasPopupOrModal": true,
  "statusBarTime": "9:41",
  "explanation": "Brief explanation of any issues found"
}`;

const body = {
	contents: [
		{
			parts: [
				{
					inlineData: {
						mimeType: "image/png",
						data: base64Image,
					},
				},
				{
					text: prompt,
				},
			],
		},
	],
	generationConfig: {
		responseMimeType: "application/json",
	},
};

try {
	console.log(`Sending image to ${model}...`);
	const resp = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!resp.ok) {
		throw new Error(`Gemini status ${resp.status}: ${await resp.text()}`);
	}

	const json = await resp.json();
	const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
	console.log("Response text:", responseText);
} catch (err) {
	console.error("Error:", err.message);
}

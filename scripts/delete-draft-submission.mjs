import process from "node:process";
import {
	AppStoreConnectClient,
	loadConfig,
	parsePrivateKey,
} from "../../eas-app-store-kit/src/index.mjs";

async function main() {
	const config = await loadConfig({
		projectRoot: process.cwd(),
		argv: process.argv,
		env: process.env,
	});

	const key = parsePrivateKey(config.privateKey);
	const client = new AppStoreConnectClient({
		keyId: config.keyId,
		issuerId: config.issuerId,
		privateKey: key,
		dryRun: config.dryRun,
		verbose: true,
	});

	const appId = config.appId;

	console.log("Fetching active review submissions...");
	const response = await client.request(
		"GET",
		`/apps/${appId}/reviewSubmissions`,
		{
			query: {
				"fields[reviewSubmissions]": "platform,submittedDate,state",
				"filter[platform]": "IOS",
				limit: 50,
			},
		},
	);

	const submissions = response.data || [];
	console.log(`Found ${submissions.length} submissions.`);

	for (const sub of submissions) {
		console.log(`- ID: ${sub.id}, State: ${sub.attributes.state}`);
		if (sub.attributes.state === "READY_FOR_REVIEW") {
			console.log(`Deleting draft review submission ${sub.id}...`);
			try {
				await client.request("DELETE", `/reviewSubmissions/${sub.id}`);
				console.log("Successfully deleted draft review submission!");
			} catch (err) {
				console.error("Failed to delete review submission:", err.message);
			}
		}
	}
}

main().catch(console.error);

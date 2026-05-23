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

	const submissionId = "ea9e6b99-5bb6-42e3-95d9-323c48d4d93e";

	console.log(`Fetching items for review submission ${submissionId}...`);
	const response = await client.request(
		"GET",
		`/reviewSubmissions/${submissionId}/items`,
		{
			limit: 50,
		},
	);

	const items = response.data || [];
	console.log(`Found ${items.length} items in submission.`);

	for (const item of items) {
		console.log(`- Item ID: ${item.id}, Type: ${item.type}`);
		console.log(`Deleting item ${item.id}...`);
		try {
			await client.request("DELETE", `/reviewSubmissionItems/${item.id}`);
			console.log("Successfully deleted review submission item!");
		} catch (err) {
			console.error("Failed to delete item:", err.message);
		}
	}
}

main().catch(console.error);

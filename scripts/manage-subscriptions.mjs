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

	const missing = [];
	if (!config.keyId) missing.push("keyId (or APP_STORE_CONNECT_KEY_ID)");
	if (!config.issuerId)
		missing.push("issuerId (or APP_STORE_CONNECT_ISSUER_ID)");
	if (!config.privateKey)
		missing.push(
			"privateKey/privateKeyPath (or APP_STORE_CONNECT_PRIVATE_KEY[_PATH])",
		);
	if (!config.appId) missing.push("appId (or APP_STORE_CONNECT_APP_ID)");

	if (missing.length > 0) {
		throw new Error(
			`Missing required App Store Connect credentials:\n- ${missing.join("\n- ")}`,
		);
	}

	const key = parsePrivateKey(config.privateKey);
	const client = new AppStoreConnectClient({
		keyId: config.keyId,
		issuerId: config.issuerId,
		privateKey: key,
		dryRun: config.dryRun,
		verbose: true,
		quiet: config.quiet,
	});

	const appId = config.appId;
	const targetProductId =
		"com.djscottyb.playinginthesandoxlookingatflowers.premium_monthly";

	console.log("--- Checking API connection ---");
	const appRes = await client.request("GET", `/apps/${appId}`, {
		query: { "fields[apps]": "name,bundleId,sku" },
	});
	console.log(
		`Connected successfully. App: "${appRes.data.attributes.name}" (${appRes.data.attributes.bundleId})`,
	);

	console.log("\n--- Checking Subscription Groups ---");
	const groupsRes = await client.request(
		"GET",
		`/apps/${appId}/subscriptionGroups`,
	);

	let group = (groupsRes.data || []).find(
		(g) => g.attributes.referenceName === "Premium Subscription Group",
	);

	if (!group) {
		console.log('No "Premium Subscription Group" found. Creating one...');
		const createGroupRes = await client.request("POST", "/subscriptionGroups", {
			body: {
				data: {
					type: "subscriptionGroups",
					attributes: {
						referenceName: "Premium Subscription Group",
					},
					relationships: {
						app: {
							data: {
								type: "apps",
								id: appId,
							},
						},
					},
				},
			},
		});
		group = createGroupRes.data;
		console.log(
			`Successfully created subscription group: ${group.attributes.referenceName} (${group.id})`,
		);
	} else {
		console.log(
			`Found existing subscription group: ${group.attributes.referenceName} (${group.id})`,
		);
	}

	console.log(
		`\n--- Checking Subscriptions in group "${group.attributes.referenceName}" ---`,
	);
	const subsRes = await client.request(
		"GET",
		`/subscriptionGroups/${group.id}/subscriptions`,
	);

	let subscription = (subsRes.data || []).find(
		(s) => s.attributes.productId === targetProductId,
	);

	if (!subscription) {
		console.log(
			`Subscription with productId "${targetProductId}" not found. Creating it...`,
		);
		const createSubRes = await client.request("POST", "/subscriptions", {
			body: {
				data: {
					type: "subscriptions",
					attributes: {
						name: "Premium Monthly",
						productId: targetProductId,
						familySharable: false,
						subscriptionPeriod: "ONE_MONTH",
					},
					relationships: {
						group: {
							data: {
								type: "subscriptionGroups",
								id: group.id,
							},
						},
					},
				},
			},
		});
		subscription = createSubRes.data;
		console.log(
			`Successfully created subscription: "${subscription.attributes.name}" (${subscription.id})`,
		);
	} else {
		console.log(
			`Found existing subscription: "${subscription.attributes.name}" (${subscription.id})`,
		);
	}

	console.log(
		`\n--- Checking localizations for subscription "${subscription.attributes.name}" ---`,
	);
	const locsRes = await client.request(
		"GET",
		`/subscriptions/${subscription.id}/subscriptionLocalizations`,
	);

	let localization = (locsRes.data || []).find(
		(l) => l.attributes.locale === "en-US",
	);

	if (!localization) {
		console.log('No "en-US" localization found. Creating it...');
		const createLocRes = await client.request(
			"POST",
			"/subscriptionLocalizations",
			{
				body: {
					data: {
						type: "subscriptionLocalizations",
						attributes: {
							locale: "en-US",
							name: "Premium Monthly",
							description:
								"Unlimited access to daily flower specimens and history",
						},
						relationships: {
							subscription: {
								data: {
									type: "subscriptions",
									id: subscription.id,
								},
							},
						},
					},
				},
			},
		);
		localization = createLocRes.data;
		console.log(
			`Successfully created localization: "${localization.attributes.name}" (${localization.id})`,
		);
	} else {
		console.log(
			`Found existing localization: "${localization.attributes.name}" (${localization.id})`,
		);
	}

	console.log(
		`\n--- Checking availability for subscription "${subscription.attributes.name}" ---`,
	);
	let availability = null;
	try {
		const availRes = await client.request(
			"GET",
			`/subscriptions/${subscription.id}/subscriptionAvailability`,
		);
		availability = availRes.data;
		if (availability) {
			console.log(
				`Found existing subscription availability: ${availability.id}`,
			);
		}
	} catch (e) {
		console.log(
			"No existing availability found or failed to fetch (might not be created yet):",
			e.message,
		);
	}

	if (!availability) {
		let territoryRelationships = [];
		try {
			console.log(
				"Fetching all available territories from App Store Connect...",
			);
			const terrRes = await client.request("GET", "/territories", {
				query: { limit: 200 },
			});
			territoryRelationships = (terrRes.data || []).map((t) => ({
				type: "territories",
				id: t.id,
			}));
			console.log(`Fetched ${territoryRelationships.length} territories.`);
		} catch (e) {
			console.log(
				"Failed to fetch territories, falling back to USA only:",
				e.message,
			);
			territoryRelationships = [{ type: "territories", id: "USA" }];
		}

		console.log("Creating subscription availability...");
		const createAvailRes = await client.request(
			"POST",
			"/subscriptionAvailabilities",
			{
				body: {
					data: {
						type: "subscriptionAvailabilities",
						attributes: {
							availableInNewTerritories: true,
						},
						relationships: {
							subscription: {
								data: {
									type: "subscriptions",
									id: subscription.id,
								},
							},
							availableTerritories: {
								data: territoryRelationships,
							},
						},
					},
				},
			},
		);
		availability = createAvailRes.data;
		console.log(`Successfully created availability: ${availability.id}`);
	}

	console.log(
		`\n--- Fetching available price points for subscription "${subscription.attributes.name}" to find $0.99 USD ---`,
	);
	const pricePointsRes = await client.request(
		"GET",
		`/subscriptions/${subscription.id}/pricePoints`,
		{
			query: {
				"filter[territory]": "USA",
				limit: 100,
			},
		},
	);

	const targetPricePoint = (pricePointsRes.data || []).find(
		(p) => p.attributes.customerPrice === "0.99",
	);

	if (!targetPricePoint) {
		throw new Error(
			"Could not find a $0.99 USD price point in the USA territory list.",
		);
	}

	console.log(`Found USD $0.99 Price Point: ID = ${targetPricePoint.id}`);

	console.log(
		`\n--- Checking current prices for subscription "${subscription.attributes.name}" ---`,
	);
	const existingTerritories = new Set();
	try {
		const currentPricesRes = await client.request(
			"GET",
			`/subscriptions/${subscription.id}/prices`,
			{
				query: { limit: 200, include: "territory" },
			},
		);
		console.log("Current prices count:", currentPricesRes.data?.length ?? 0);

		for (const price of currentPricesRes.data || []) {
			const terrId = price.relationships?.territory?.data?.id;
			if (terrId) {
				existingTerritories.add(terrId);
			}
		}
	} catch (e) {
		console.log("Failed to fetch current prices:", e.message);
	}

	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	if (!existingTerritories.has("USA")) {
		console.log("\n--- Creating Subscription Price for USA ---");
		const priceRes = await client.request("POST", "/subscriptionPrices", {
			body: {
				data: {
					type: "subscriptionPrices",
					relationships: {
						subscription: {
							data: {
								type: "subscriptions",
								id: subscription.id,
							},
						},
						subscriptionPricePoint: {
							data: {
								type: "subscriptionPricePoints",
								id: targetPricePoint.id,
							},
						},
						territory: {
							data: {
								type: "territories",
								id: "USA",
							},
						},
					},
				},
			},
		});
		console.log("Successfully set USD $0.99 price for USA:", priceRes.data.id);
		existingTerritories.add("USA");
		await delay(150);
	} else {
		console.log("USA subscription price is already configured.");
	}

	console.log(
		"\n--- Fetching equalizations for this price point to configure global pricing ---",
	);
	let equalizations = [];
	try {
		const equalizationsRes = await client.request(
			"GET",
			`/subscriptionPricePoints/${targetPricePoint.id}/equalizations`,
			{ query: { limit: 200, include: "territory" } },
		);
		equalizations = equalizationsRes.data || [];
		console.log(`Total equalizations available: ${equalizations.length}`);
	} catch (e) {
		console.log("Failed to fetch equalizations:", e.message);
	}

	if (equalizations.length > 0) {
		console.log("\n--- Configuring equalized prices for other territories ---");
		let createdCount = 0;
		let skippedCount = 0;

		for (const eq of equalizations) {
			const territoryId = eq.relationships?.territory?.data?.id;
			if (!territoryId) {
				console.log(
					`Skipping equalization ${eq.id} with missing territory relationship.`,
				);
				continue;
			}

			if (existingTerritories.has(territoryId)) {
				skippedCount++;
				continue;
			}

			console.log(
				`[${createdCount + skippedCount + 1}/${equalizations.length}] Setting price for territory ${territoryId} (${eq.attributes.customerPrice})...`,
			);
			try {
				await client.request("POST", "/subscriptionPrices", {
					body: {
						data: {
							type: "subscriptionPrices",
							relationships: {
								subscription: {
									data: {
										type: "subscriptions",
										id: subscription.id,
									},
								},
								subscriptionPricePoint: {
									data: {
										type: "subscriptionPricePoints",
										id: eq.id,
									},
								},
								territory: {
									data: {
										type: "territories",
										id: territoryId,
									},
								},
							},
						},
					},
				});
				createdCount++;
				existingTerritories.add(territoryId);
				await delay(150);
			} catch (err) {
				console.error(
					`Failed to set price for territory ${territoryId}:`,
					err.message,
				);
				if (err.payload) {
					console.error("Error Details:", JSON.stringify(err.payload, null, 2));
				}
			}
		}
		console.log(
			`Global pricing configuration complete: set ${createdCount} new prices, ${skippedCount} already existed.`,
		);
	}

	console.log("\n--- Subscription automation completed successfully! ---");
}

main().catch((error) => {
	console.error(`\x1b[31mError:\x1b[0m ${error.message}`);
	if (error.payload) {
		console.error("Error Payload:", JSON.stringify(error.payload, null, 2));
	}
	if (error.stack) {
		console.error(error.stack);
	}
	process.exit(1);
});

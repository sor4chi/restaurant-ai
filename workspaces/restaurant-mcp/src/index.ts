import * as path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import { z } from "zod";
import { logger } from "./logger";
import type {
	GetLargeAreaCodeApiResponse,
	GetMiddleAreaCodeApiResponse,
	GetSmallAreaCodeApiResponse,
	SearchRestaurantApiResponse,
} from "./types";

const __dirname = path.resolve();
const envPath = path.join(__dirname, "../.env");

dotenv.config({ path: envPath });

const API_KEY = process.env.API_KEY || "";

const BASE_URL = "http://webservice.recruit.co.jp/hotpepper";

class HotPepperClient {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async searchRestaurant({
		keyword,
		largeAreaCode,
		middleAreaCode,
		smallAreaCode,
	}: {
		keyword: string;
		largeAreaCode: string;
		middleAreaCode?: string;
		smallAreaCode?: string;
	}): Promise<SearchRestaurantApiResponse> {
		const query = new URLSearchParams({
			key: this.apiKey,
			format: "json",
			count: "30",
			large_area: largeAreaCode,
			middle_area: middleAreaCode || "",
			small_area: smallAreaCode || "",
			keyword: keyword,
		});
		const url = `${BASE_URL}/gourmet/v1/?${query}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}
		return response.json();
	}

	async getLargeAreaCode(): Promise<GetLargeAreaCodeApiResponse> {
		const url = `${BASE_URL}/large_area/v1/?key=${this.apiKey}&format=json`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}
		return response.json();
	}

	async getMiddleAreaCode(
		largeAreaCode: string,
	): Promise<GetMiddleAreaCodeApiResponse> {
		const url = `${BASE_URL}/middle_area/v1/?key=${this.apiKey}&large_area=${largeAreaCode}&format=json`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}
		return response.json();
	}

	async getSmallAreaCode(
		middleAreaCode: string,
	): Promise<GetSmallAreaCodeApiResponse> {
		const url = `${BASE_URL}/small_area/v1/?key=${this.apiKey}&middle_area=${middleAreaCode}&format=json`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}
		return response.json();
	}
}

export async function startServer(): Promise<McpServer> {
	const client = new HotPepperClient(API_KEY);
	const server = new McpServer({
		name: "MCP Server for Restaurant Information",
		version: "0.0.1",
	});

	logger.setLevel("warn");

	server.tool(
		"get_restaurant_info",
		`
場所やキーワードを指定して、該当する飲食店の情報を取得します。
	`,
		{
			largeAreaCode: z
				.string()
				.describe("大エリアコードを指定して、検索範囲を絞ります。"),
			middleAreaCode: z
				.string()
				.optional()
				.describe("中エリアコードを指定して、検索範囲を絞ります。"),
			smallAreaCode: z
				.string()
				.optional()
				.describe("小エリアコードを指定して、検索範囲を絞ります。"),
			keyword: z.string().describe(
				`
キーワードを指定して、検索範囲を絞ります。
店名かな、店名、住所、駅名、お店ジャンルキャッチ、キャッチのフリーワード検索(部分一致)が可能です。半角スペース区切りの文字列を渡すことでAND検索になります。
`.trim(),
			),
		},
		async ({ keyword, largeAreaCode, middleAreaCode, smallAreaCode }) => {
			const res = await client.searchRestaurant({
				keyword: keyword,
				largeAreaCode: largeAreaCode,
				middleAreaCode: middleAreaCode,
				smallAreaCode: smallAreaCode,
			});

			return {
				content: [
					{
						type: "text",
						text: res.results.shop
							.map((shop) => {
								const name = shop.name;
								const address = shop.address;
								const url = shop.urls.pc;
								const genre = shop.genre.name;
								const budget = shop.budget?.average || "不明";

								return `店名: ${name}\n住所: ${address}\nジャンル: ${genre}\n予算: ${budget}\nURL: ${url}`;
							})
							.join("\n\n"),
					},
				],
			};
		},
	);

	server.tool(
		"get_large_area_code",
		`
飲食店情報を絞り込むための大エリアコードを取得します。
	`,
		{},
		async () => {
			const areaCodes = await client.getLargeAreaCode();
			return {
				content: [
					{
						type: "text",
						text: areaCodes.results.large_area
							.map((area) => `${area.code}: ${area.name}`)
							.join(",\n"),
					},
				],
			};
		},
	);

	server.tool(
		"get_middle_area_code",
		`
飲食店情報を絞り込むための中エリアコードを取得します。
	`,
		{
			largeAreaCode: z
				.string()
				.describe("大エリアコードを指定して、検索範囲を絞ります。"),
		},
		async ({ largeAreaCode }) => {
			const areaCodes = await client.getMiddleAreaCode(largeAreaCode);
			return {
				content: [
					{
						type: "text",
						text: areaCodes.results.middle_area
							.map((area) => `${area.code}: ${area.name}`)
							.join(",\n"),
					},
				],
			};
		},
	);

	server.tool(
		"get_small_area_code",
		`
飲食店情報を絞り込むための小エリアコードを取得します。
	`,
		{
			middleAreaCode: z
				.string()
				.describe("中エリアコードを指定して、検索範囲を絞ります。"),
		},
		async ({ middleAreaCode }) => {
			const areaCodes = await client.getSmallAreaCode(middleAreaCode);
			return {
				content: [
					{
						type: "text",
						text: areaCodes.results.small_area
							.map((area) => `${area.code}: ${area.name}`)
							.join(",\n"),
					},
				],
			};
		},
	);

	const transport = new StdioServerTransport();
	await server.connect(transport);
	logger.info("MCP Server running on stdio");

	return server;
}

startServer().catch((error) => {
	logger.warn("Error starting MCP server:", error);
});

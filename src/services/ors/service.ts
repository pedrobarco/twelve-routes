import axios from "axios";

import type { ORSOptimizationRequest, ORSOptimizationResponse } from "./models";

export const ors = axios.create({
  baseURL: "https://api.openrouteservice.org",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function optimizeRoute(
  apiKey: string,
  body: ORSOptimizationRequest,
): Promise<ORSOptimizationResponse> {
  const response = await ors.post("/optimization", body, {
    headers: {
      Authorization: apiKey,
    },
  });
  return response.data;
}

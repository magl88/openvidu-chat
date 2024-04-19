import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/utils/api";

export const sessionAPI = createApi({
	reducerPath: "sessionAPI",
	baseQuery: axiosBaseQuery(),
	endpoints: (builder) => ({
		createSession: builder.query({
			query: (sessionId: string) => ({
				method: "POST",
				url: "sessions",
				headers: { "Content-Type": "application/json" },
				data: { customSessionId: sessionId },
			}),
		}),
		createToken: builder.query({
			query: (sessionId: string) => ({
				method: "POST",
				url: `sessions/${sessionId}/connections`,
				headers: { "Content-Type": "application/json" },
			}),
		}),
	}),
});

export const { useCreateTokenQuery, useCreateSessionQuery } = sessionAPI;

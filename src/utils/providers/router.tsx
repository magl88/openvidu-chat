import { MainLayout } from "@/components/";
import { Main, NotFound, SessionPage } from "@/pages";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{
				path: "/",
				element: <Main />,
			},
			{
				path: "/session/:sessionId",
				element: <SessionPage />,
			},
		],
	},
	{
		path: "*",
		element: <NotFound />,
	},
]);

import { combineReducers, configureStore, ConfigureStoreOptions } from "@reduxjs/toolkit";
import { sessionAPI } from "@/utils/services";

const rootReducer = combineReducers({
	[sessionAPI.reducerPath]: sessionAPI.reducer,
});

export const setupStore = (options?: ConfigureStoreOptions["preloadedState"] | undefined) => {
	return configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sessionAPI.middleware),
		...options,
	});
};

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];

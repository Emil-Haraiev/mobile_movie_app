import { account } from "@/services/appwrite";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { ID, Models, OAuthProvider } from "react-native-appwrite";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = "loading" | "pending" | "guest" | "authenticated";

type AuthContextValue = {
    status: AuthStatus;
    user: Models.User<Models.Preferences> | null;
    startAuth: () => Promise<void>;
    refreshUser: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    skipAuth: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AUTH_MODE_KEY = "auth-mode";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Something went wrong";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);

    const markGuestMode = async () => {
        await SecureStore.setItemAsync(AUTH_MODE_KEY, "guest");
    };

    const clearAuthMode = async () => {
        await SecureStore.deleteItemAsync(AUTH_MODE_KEY);
    };

    const loadSession = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            setStatus("authenticated");
            return;
        } catch {
            const mode = await SecureStore.getItemAsync(AUTH_MODE_KEY);
            setStatus(mode === "guest" ? "guest" : "pending");
            setUser(null);
        }
    };

    useEffect(() => {
        void loadSession();
    }, []);

    const startAuth = async () => {
        await clearAuthMode();
        setStatus("pending");
    };

    const refreshUser = async () => {
        const currentUser = await account.get();
        setUser(currentUser);
        setStatus("authenticated");
    };

    const signIn = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession({ email, password });
            const currentUser = await account.get();
            await clearAuthMode();
            setUser(currentUser);
            setStatus("authenticated");
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        try {
            await account.create({
                userId: ID.unique(),
                email,
                password,
                name,
            });
            await signIn(email, password);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    };

    const signInWithGoogle = async () => {
        const callbackUrl = Linking.createURL("auth-callback");

        const oauthUrl = account.createOAuth2Token({
            provider: OAuthProvider.Google,
            success: callbackUrl,
            failure: callbackUrl,
        });

        if (!oauthUrl) {
            throw new Error("Failed to start Google auth flow");
        }

        const result = await WebBrowser.openAuthSessionAsync(
            oauthUrl.toString(),
            callbackUrl,
        );

        if (result.type !== "success") {
            throw new Error("Google sign-in was canceled");
        }

        const { queryParams } = Linking.parse(result.url);
        const userId = queryParams?.userId;
        const secret = queryParams?.secret;
        const error = queryParams?.error;

        if (error) {
            throw new Error("Google sign-in failed");
        }

        if (typeof userId !== "string" || typeof secret !== "string") {
            throw new Error("Invalid OAuth callback response");
        }

        await account.createSession({ userId, secret });
        const currentUser = await account.get();

        await clearAuthMode();
        setUser(currentUser);
        setStatus("authenticated");
    };

    const skipAuth = async () => {
        await markGuestMode();
        setUser(null);
        setStatus("guest");
    };

    const signOut = async () => {
        try {
            await account.deleteSession({ sessionId: "current" });
        } catch {
            // Ignore network/session errors and still reset local auth state.
        }

        await clearAuthMode();
        setUser(null);
        setStatus("pending");
    };

    const value = useMemo(
        () => ({
            status,
            user,
            startAuth,
            refreshUser,
            signIn,
            signUp,
            signInWithGoogle,
            skipAuth,
            signOut,
        }),
        [status, user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};

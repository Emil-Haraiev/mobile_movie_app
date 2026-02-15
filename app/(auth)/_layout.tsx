import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const AuthLayout = () => {
    const { status } = useAuth();

    if (status === "authenticated" || status === "guest") {
        return <Redirect href="/" />;
    }

    if (status === "loading") {
        return (
            <View className="flex-1 bg-primary items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
        </Stack>
    );
};

export default AuthLayout;

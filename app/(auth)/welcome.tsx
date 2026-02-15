import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { images } from "@/constants/images";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
    const { signIn, signUp, signInWithGoogle, skipAuth } = useAuth();

    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = () => {
        if (!email.trim() || !password.trim()) {
            return "Enter your email and password";
        }

        if (password.trim().length < 8) {
            return "Password must be at least 8 characters";
        }

        if (isSignUpMode && !name.trim()) {
            return "Enter your name";
        }

        return null;
    };

    const handleEmailAuth = async () => {
        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            if (isSignUpMode) {
                await signUp(name.trim(), email.trim(), password.trim());
            } else {
                await signIn(email.trim(), password.trim());
            }
        } catch (authError) {
            setError(authError instanceof Error ? authError.message : "Authentication error");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        setLoading(true);

        try {
            await signInWithGoogle();
        } catch (authError) {
            setError(authError instanceof Error ? authError.message : "Failed to sign in with Google");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setError(null);
        setLoading(true);

        try {
            await skipAuth();
        } catch {
            setError("Failed to continue without authorization");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="absolute w-full h-full z-0"
                resizeMode="cover"
            />
            <View className="flex-1 justify-center px-6">
                <Image source={icons.logo} className="w-16 h-16 self-center mb-6" />
                <Text className="text-white text-2xl font-bold text-center">
                    {isSignUpMode ? "Create account" : "Sign in to your account"}
                </Text>
                <Text className="text-light-200 text-center mt-2 mb-8">
                    Sign in to sync your data and save movies
                </Text>

                {isSignUpMode && (
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Name"
                        placeholderTextColor="#A8B5DB"
                        className="bg-dark-200 text-white rounded-xl px-4 py-4 mb-3"
                    />
                )}

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor="#A8B5DB"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="bg-dark-200 text-white rounded-xl px-4 py-4 mb-3"
                />

                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#A8B5DB"
                    secureTextEntry
                    className="bg-dark-200 text-white rounded-xl px-4 py-4 mb-2"
                />

                {error && <Text className="text-red-400 mt-2 mb-3">{error}</Text>}

                <TouchableOpacity
                    disabled={loading}
                    onPress={handleEmailAuth}
                    className="bg-accent rounded-xl py-4 mt-2"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-center font-semibold text-base">
                            {isSignUpMode ? "Sign up" : "Sign in"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={loading}
                    onPress={handleGoogleAuth}
                    className="bg-dark-200 rounded-xl py-4 mt-3"
                >
                    <Text className="text-white text-center font-semibold text-base">
                        Continue with Google
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={loading}
                    onPress={() => setIsSignUpMode((prev) => !prev)}
                    className="mt-6"
                >
                    <Text className="text-light-200 text-center">
                        {isSignUpMode
                            ? "Already have an account? Sign in"
                            : "Don't have an account? Sign up"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={loading} onPress={handleSkip} className="mt-4">
                    <Text className="text-center text-gray-400">Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Welcome;

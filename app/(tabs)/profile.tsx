import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { account } from "@/services/appwrite";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getFallbackAvatar = (name?: string, email?: string) => {
    const value = encodeURIComponent(name?.trim() || email?.trim() || "Movie User");
    return `https://ui-avatars.com/api/?name=${value}&background=151312&color=ffffff&size=256`;
};

const Profile = () => {
    const { status, user, signOut, startAuth, refreshUser } = useAuth();

    const currentAvatar = useMemo(() => {
        if (!user) return null;

        const prefs = user.prefs as Record<string, unknown>;
        const avatarUrl = typeof prefs?.avatarUrl === "string" ? prefs.avatarUrl : "";

        return avatarUrl || getFallbackAvatar(user.name, user.email);
    }, [user]);

    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(user?.name ?? "");

        const prefs = (user?.prefs ?? {}) as Record<string, unknown>;
        setAvatarUrl(typeof prefs.avatarUrl === "string" ? prefs.avatarUrl : "");
    }, [user]);

    const onSaveProfile = async () => {
        if (!user) return;

        setSaving(true);
        setError(null);

        try {
            const trimmedName = name.trim();
            const trimmedAvatar = avatarUrl.trim();

            if (!trimmedName) {
                throw new Error("This placeholder can't be empty");
            }

            if (trimmedName !== user.name) {
                await account.updateName({ name: trimmedName });
            }

            const currentPrefs = (user.prefs ?? {}) as Record<string, unknown>;
            const nextPrefs = {
                ...currentPrefs,
                avatarUrl: trimmedAvatar,
            };

            await account.updatePrefs({ prefs: nextPrefs });
            await refreshUser();
            setEditMode(false);
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (status !== "authenticated") {
        return (
            <SafeAreaView className="bg-primary flex-1 px-6">
                <View className="flex-1 justify-center items-center">
                    <View className="bg-dark-200 rounded-3xl p-6 w-full">
                        <Text className="text-white text-xl font-bold text-center">Guest Mode</Text>
                        <Text className="text-light-200 text-center mt-3">
                            Sign in to customize your profile and save movies
                        </Text>
                        <TouchableOpacity
                            onPress={() => void startAuth()}
                            className="bg-accent rounded-xl py-3 mt-6"
                        >
                            <Text className="text-white text-center font-semibold">
                                Sign in or register
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const currentUser = user;

    if (!currentUser) {
        return null;
    }

    return (
        <SafeAreaView className="bg-primary flex-1 ">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />
            <View className="px-6 mt-5">
                <View className="mt-8">
                    <Text className="text-white text-3xl font-bold">Profile</Text>
                    <Text className="text-light-200 mt-1">Manage your account</Text>
                </View>

                <View className="bg-dark-200 rounded-3xl px-5 py-6 mt-8">
                    <Image
                        source={{
                            uri:
                                currentAvatar ||
                                getFallbackAvatar(currentUser.name, currentUser.email),
                        }}
                        className="w-24 h-24 rounded-full self-center"
                    />

                    <Text className="text-white text-xl font-bold text-center mt-4">
                        {currentUser.name || "User"}
                    </Text>
                    <Text className="text-light-200 text-center mt-1">{currentUser.email}</Text>

                    {!editMode ? (
                        <TouchableOpacity
                            onPress={() => setEditMode(true)}
                            className="bg-accent rounded-xl py-3 mt-6"
                        >
                            <Text className="text-white text-center font-semibold">Edit Profile</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="mt-6">
                            <Text className="text-light-200 mb-2">Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter name"
                                placeholderTextColor="#A8B5DB"
                                className="bg-primary text-white rounded-xl px-4 py-3"
                            />

                            <Text className="text-light-200 mb-2 mt-4">Profile Photo (URL)</Text>
                            <TextInput
                                value={avatarUrl}
                                onChangeText={setAvatarUrl}
                                placeholder="https://..."
                                placeholderTextColor="#A8B5DB"
                                autoCapitalize="none"
                                className="bg-primary text-white rounded-xl px-4 py-3"
                            />

                            <Text className="text-light-200 text-xs mt-2">
                                For Google accounts, you can paste a link to the profile photo manually.
                            </Text>

                            {error && <Text className="text-red-400 mt-3">{error}</Text>}

                            <View className="flex-row gap-3 mt-5">
                                <TouchableOpacity
                                    disabled={saving}
                                    onPress={() => setEditMode(false)}
                                    className="flex-1 bg-primary rounded-xl py-3"
                                >
                                    <Text className="text-white text-center font-semibold">Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    disabled={saving}
                                    onPress={() => void onSaveProfile()}
                                    className="flex-1 bg-accent rounded-xl py-3"
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-white text-center font-semibold">Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => void signOut()}
                    className="bg-primary border border-dark-200 rounded-xl py-3 mt-6"
                >
                    <Text className="text-white text-center font-semibold">Sign Out of Account</Text>
                </TouchableOpacity>

                <View className="items-center mt-6">
                    <Image source={icons.logo} className="w-7 h-6" />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Profile;

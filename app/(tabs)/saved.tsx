import MovieCard from "@/components/MovieCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { getSavedMovies, SavedMovie } from "@/storage/savedMovies";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Saved = () => {
    const { status, user, startAuth } = useAuth();
    const [movies, setMovies] = useState<SavedMovie[]>([]);

    const loadSaved = useCallback(async () => {
        if (!user?.$id) {
            setMovies([]);
            return;
        }

        const saved = await getSavedMovies(user.$id);
        setMovies(saved);
    }, [user?.$id]);

    useFocusEffect(
        useCallback(() => {
            void loadSaved();
        }, [loadSaved]),
    );

    if (status !== "authenticated") {
        return (
            <SafeAreaView className="bg-primary flex-1 px-10">
                <View className="flex justify-center items-center flex-1 flex-col gap-5">
                    <Image source={icons.save} className="size-10" tintColor="#fff" />
                    <Text className="text-gray-300 text-base text-center">
                        Sign in to save movies
                    </Text>
                    <TouchableOpacity
                        onPress={() => void startAuth()}
                        className="bg-accent rounded-xl px-5 py-3"
                    >
                        <Text className="text-white font-semibold">Sign in or create an account</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />
            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={({ item }) => <MovieCard {...item} />}
                columnWrapperStyle={{
                    justifyContent: "flex-start",
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10,
                }}
                contentContainerStyle={{ paddingBottom: 120 }}
                className="px-5"
                ListHeaderComponent={
                    <View>
                        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-8 mx-auto" />
                        <Text className="text-xl text-white font-bold mb-5">Saved Movies</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="mt-10">
                        <Text className="text-gray-400 text-center">No saved movies yet</Text>
                    </View>
                }
            />
        </View>
    );
};

export default Saved;

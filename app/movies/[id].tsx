import { icons } from "@/constants/icons";
import { useAuth } from "@/context/AuthContext";
import { fetchMovieDetails } from "@/services/api";
import useFetch from "@/services/useFetch";
import { isMovieSaved, removeMovie, saveMovie } from "@/storage/savedMovies";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">{value || "N/A"}</Text>
    </View>
);

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const { data: movie } = useFetch(() => fetchMovieDetails(id as string));
    const { status, user } = useAuth();

    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const canSave = status === "authenticated" && !!user?.$id;

    useEffect(() => {
        const checkSavedState = async () => {
            if (!movie?.id || !user?.$id || !canSave) {
                setSaved(false);
                return;
            }

            const alreadySaved = await isMovieSaved(user.$id, movie.id);
            setSaved(alreadySaved);
        };

        void checkSavedState();
    }, [movie?.id, user?.$id, canSave]);

    const savePayload = useMemo(() => {
        if (!movie) return null;

        return {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path ?? "",
            vote_average: movie.vote_average,
            release_date: movie.release_date,
        };
    }, [movie]);

    const onToggleSave = async () => {
        if (!canSave || !user?.$id || !savePayload) {
            setSaveError("Saving is available only after signing in");
            return;
        }

        setSaveError(null);

        if (saved) {
            await removeMovie(user.$id, savePayload.id);
            setSaved(false);
            return;
        }

        await saveMovie(user.$id, savePayload);
        setSaved(true);
    };

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View>
                    <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}` }}
                        className="w-full h-[550px]"
                        resizeMode="stretch"
                    />
                </View>
                <View className="flex-col items-start justify-center mt-5 px-5">
                    <Text className="text-white font-bold text-xl">{movie?.title}</Text>
                    <View className="flex-row items-center gap-x-1 mt-2">
                        <Text className="text-light-200 text-sm">
                            {movie?.release_date?.split("-")[0]}
                        </Text>
                        <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
                    </View>
                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-white font-bold text-sm">
                            {(movie?.vote_average ?? 0).toFixed(1)}
                        </Text>
                        <Text className="text-light-200 text-sm">({movie?.vote_count} votes)</Text>
                    </View>
                    <MovieInfo label="OverView" value={movie?.overview} />
                    <MovieInfo
                        label="Genres"
                        value={movie?.genres?.map((g) => g.name).join(" - ") || "N/A"}
                    />
                    <View className="flex flex-row justify-between w-1/2">
                        <MovieInfo
                            label="Budget"
                            value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
                        />
                        <MovieInfo
                            label="Revenue"
                            value={`$${Math.round((movie?.revenue ?? 0) / 1_000_000)} million`}
                        />
                    </View>
                    <MovieInfo
                        label="Production Companies"
                        value={movie?.production_companies.map((c) => c.name).join(" - ") || "N/A"}
                    />

                    <TouchableOpacity
                        onPress={() => void onToggleSave()}
                        className={`rounded-xl py-3 px-4 mt-6 ${saved ? "bg-dark-200" : "bg-accent"}`}
                    >
                        <Text className="text-white font-semibold text-center">
                            {saved ? "Remove from Saved" : "Move to Saved"}
                        </Text>
                    </TouchableOpacity>

                    {!canSave && (
                        <Text className="text-light-200 mt-3 text-sm">
                            Sign in to save movies
                        </Text>
                    )}

                    {saveError && <Text className="text-red-400 mt-2 text-sm">{saveError}</Text>}
                </View>
            </ScrollView>
            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-3xl py-3.5 flex flex-row items-center justify-center"
                onPress={router.back}
            >
                <Image
                    source={icons.arrow}
                    className="size-5 ml-5 mr-1 mt-0.5 rotate-180"
                    tintColor="#fff"
                />
                <Text className="text-white font-semibold text-base">Go back</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MovieDetails;

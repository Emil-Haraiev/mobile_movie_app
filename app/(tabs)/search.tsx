import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchMovies } from '@/services/api';
import { updateSearchCount } from '@/services/appwrite';
import useFetch from '@/services/useFetch';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const trackedQueriesRef = useRef<string[]>([]);


    const {
        data: movies = [],
        loading,
        error,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({ query: searchQuery }), false);


    useEffect(() => {

        const timeoutId = setTimeout(async () => {

            if (searchQuery.trim()) {
                await loadMovies();

            } else {
                reset();
            }
        }, 1000);

        return () => clearTimeout(timeoutId);

    }, [searchQuery, loadMovies, reset]);

    useEffect(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (normalizedQuery.length < 2) return;
        if (!(movies?.length > 0 && movies?.[0])) return;

        // If a longer query was already tracked (e.g. "messi"),
        // skip tracking its shortened versions while deleting ("mess", "mes"...).
        const hasLongerTrackedPrefix = trackedQueriesRef.current.some((trackedQuery) =>
            trackedQuery.startsWith(normalizedQuery),
        );

        if (hasLongerTrackedPrefix) return;

        if (trackedQueriesRef.current.includes(normalizedQuery)) return;

        trackedQueriesRef.current.push(normalizedQuery);
        void updateSearchCount(normalizedQuery, movies[0]);
    }, [movies, searchQuery]);
    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
            <FlatList
                className="px-5"
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />} keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: 'flex-start', gap: 16, paddingVertical: 16 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image source={icons.logo} className="w-12 h-10" />
                        </View>
                        <View className="my-5">
                            <SearchBar
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                                placeholder="Search for a movies"
                            />
                        </View>
                        {loading && (
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                                className="my-3"
                            />
                        )}

                        {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: {error.message}
                            </Text>
                        )}

                        {!loading &&
                            !error &&
                            searchQuery.trim() &&
                            movies?.length! > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search Results for{" "}
                                    <Text className="text-accent">{searchQuery}</Text>
                                </Text>
                            )}

                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className='mt-10 px-5'>
                            <Text className='text-gray-500 text-center '>{searchQuery.trim() ? 'No movies found for your search.' : 'Search for a movie'}</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    )
}
export default Search

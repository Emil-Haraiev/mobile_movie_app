import * as SecureStore from "expo-secure-store";

export type SavedMovie = Pick<
    Movie,
    "id" | "title" | "poster_path" | "vote_average" | "release_date"
>;

const sanitizeKeyPart = (value: string) => value.replace(/[^A-Za-z0-9._-]/g, "_");

const keyForUser = (userId: string) => `saved_movies_${sanitizeKeyPart(userId)}`;

const parseMovies = (value: string | null): SavedMovie[] => {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as SavedMovie[]) : [];
    } catch {
        return [];
    }
};

export const getSavedMovies = async (userId: string): Promise<SavedMovie[]> => {
    const value = await SecureStore.getItemAsync(keyForUser(userId));
    return parseMovies(value);
};

export const isMovieSaved = async (
    userId: string,
    movieId: number,
): Promise<boolean> => {
    const movies = await getSavedMovies(userId);
    return movies.some((movie) => movie.id === movieId);
};

export const saveMovie = async (userId: string, movie: SavedMovie): Promise<void> => {
    const movies = await getSavedMovies(userId);

    if (movies.some((item) => item.id === movie.id)) {
        return;
    }

    const updated = [movie, ...movies];
    await SecureStore.setItemAsync(keyForUser(userId), JSON.stringify(updated));
};

export const removeMovie = async (
    userId: string,
    movieId: number,
): Promise<void> => {
    const movies = await getSavedMovies(userId);
    const updated = movies.filter((movie) => movie.id !== movieId);
    await SecureStore.setItemAsync(keyForUser(userId), JSON.stringify(updated));
};

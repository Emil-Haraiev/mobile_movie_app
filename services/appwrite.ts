import { Query, } from "appwrite";
import { Client, Databases, ID } from "react-native-appwrite";


const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!;

const cliet = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(cliet);

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.equal('searchTerm', query),
        ]);
        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];

            await database.updateDocument(DATABASE_ID, TABLE_ID, existingMovie.$id, {
                searchTerm: query,
                count: existingMovie.count + 1,
                title: movie.title,
            });
        } else {
            await database.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
                searchTerm: query,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/q500${movie.poster_path}`,
                title: movie.title
            });
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);
        return result.documents as unknown as TrendingMovie[]
    } catch (error) {
        console.log(error);
        return undefined;
    }
}
"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { fetcher } from "@/lib/fetcher";

interface Movie {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  movieGenre: Array<{
    genre: {
      name: string;
    };
  }>;
}

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Fetch movies with SWR for client-side caching
  const { data: movies, error, isLoading } = useSWR<Movie[]>("/api/movie", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
    dedupingInterval: 10000, // Cache for 10 seconds
  });

  // Fetch genres for filter
  const { data: genres } = useSWR<Array<{ id: string; name: string }>>("/api/genre", fetcher);

  const filteredMovies = movies?.filter(
    (movie) =>
      selectedGenre === "" ||
      movie.movieGenre.some((mg) => mg.genre.name === selectedGenre)
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Movies</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Movie Reservation</h1>
          <p className="text-gray-600 mt-2">Book your favorite movies now!</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          <label
            htmlFor="genre-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Genre:
          </label>
          <select
            id="genre-filter"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres?.map((genre) => (
              <option key={genre.id} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-64 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && filteredMovies && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={movie.image || "/placeholder-movie.jpg"}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {movie.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {movie.description}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.movieGenre.slice(0, 2).map((mg, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {mg.genre.name}
                      </span>
                    ))}
                    {movie.movieGenre.length > 2 && (
                      <span className="text-gray-500 text-xs">
                        +{movie.movieGenre.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${movie.price || 0}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMovies?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-600">Try adjusting your filter or check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
}

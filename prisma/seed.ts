import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
  console.log("Seeding movies and genres...");

  // First, create genres
  const genreNames = ["Action", "Crime", "Sci-Fi", "Thriller", "Romance", "Drama", "Adventure", "Horror", "Animation", "Family"];
  
  const genres = await Promise.all(
    genreNames.map(async (name) => {
      const existingGenre = await prisma.genre.findFirst({
        where: { name }
      });
      
      if (existingGenre) {
        return existingGenre;
      }
      
      return prisma.genre.create({
        data: { name }
      });
    })
  );

  const genreMap = genres.reduce((acc, genre) => {
    acc[genre.name] = genre.id;
    return acc;
  }, {} as Record<string, string>);

  // Create movies with show dates and hours
  const movies = [
    {
      title: "The Dark Knight",
      description: "Batman faces the Joker in this epic superhero thriller that explores the thin line between heroism and vigilantism.",
      image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      maxShowtime: 3,
      price: 50000,
      genres: ["Action", "Crime"]
    },
    {
      title: "Inception",
      description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
      image: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      maxShowtime: 3,
      price: 55000,
      genres: ["Sci-Fi", "Thriller"]
    },
    {
      title: "Titanic",
      description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
      image: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
      maxShowtime: 2,
      price: 45000,
      genres: ["Romance", "Drama"]
    },
    {
      title: "Avengers: Endgame",
      description: "The Avengers assemble once more to reverse the damage caused by Thanos and restore balance to the universe.",
      image: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      maxShowtime: 3,
      price: 60000,
      genres: ["Action", "Adventure"]
    },
    {
      title: "The Conjuring",
      description: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
      image: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg",
      maxShowtime: 3,
      price: 48000,
      genres: ["Horror", "Thriller"]
    },
    {
      title: "Toy Story 4",
      description: "Woody, Buzz Lightyear and the rest of the gang embark on a road trip with Bonnie and a new toy named Forky.",
      image: "https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
      maxShowtime: 3,
      price: 40000,
      genres: ["Animation", "Family"]
    },
    {
      title: "Joker",
      description: "A failed comedian begins his slow descent into madness as he transforms into the criminal mastermind known as the Joker.",
      image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
      maxShowtime: 3,
      price: 52000,
      genres: ["Drama", "Crime"]
    },
    {
      title: "Spider-Man: No Way Home",
      description: "Peter Parker's secret identity is revealed, and he asks Doctor Strange for help, but a spell goes wrong.",
      image: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
      maxShowtime: 3,
      price: 58000,
      genres: ["Action", "Adventure"]
    },
    {
      title: "Interstellar",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      maxShowtime: 2,
      price: 54000,
      genres: ["Sci-Fi", "Drama"]
    },
    {
      title: "The Lion King",
      description: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
      image: "https://image.tmdb.org/t/p/w500/dzBtMocZuJbjLOXvrl4zGYigDzh.jpg",
      maxShowtime: 3,
      price: 42000,
      genres: ["Animation", "Family"]
    }
  ];

  for (const movieData of movies) {
    // Create movie
    const movie = await prisma.movie.create({
      data: {
        title: movieData.title,
        description: movieData.description,
        image: movieData.image,
        maxShowtime: movieData.maxShowtime,
        price: movieData.price
      }
    });

    // Create movie-genre relationships
    for (const genreName of movieData.genres) {
      await prisma.movieGenre.create({
        data: {
          movieId: movie.id,
          genreId: genreMap[genreName]
        }
      });
    }

    // Create show dates (today + next 6 days)
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + i);
      showDate.setHours(0, 0, 0, 0);

      const movieShowDate = await prisma.movieShowDate.create({
        data: {
          movieShowDate: showDate,
          movieId: movie.id
        }
      });

      // Create show hours for each date (limited by maxShowtime)
      const showTimes = ["10:00", "14:00", "18:00"];
      for (let j = 0; j < Math.min(movieData.maxShowtime, showTimes.length); j++) {
        const [hours, minutes] = showTimes[j].split(":").map(Number);
        const showDateTime = new Date(showDate);
        showDateTime.setHours(hours, minutes, 0, 0);

        const movieShowHour = await prisma.movieShowHour.create({
          data: {
            movieShowDateId: movieShowDate.id,
            movieShowHour: showDateTime
          }
        });

        // Create 50 seats for each show hour (10 rows x 5 seats)
        for (let seat = 1; seat <= 50; seat++) {
          await prisma.movieSeat.create({
            data: {
              movieShowHourId: movieShowHour.id,
              status: 0 // 0 = available, 1 = reserved, 2 = occupied
            }
          });
        }
      }
    }

    console.log(`Created movie: ${movie.title} with ${movieData.maxShowtime} show times`);
  }

  console.log("Seeding completed!");
}

main();
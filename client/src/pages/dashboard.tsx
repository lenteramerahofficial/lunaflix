import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LogOutIcon, PlayIcon, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movie-card";
import { useQuery } from "@tanstack/react-query";
import { clearAuthState, getUsername } from "@/lib/localStorage";
import { Movie } from "@shared/schema";
import { Loader } from "@/components/ui/loader";
import { VideoPlayer } from "@/components/ui/video-player";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Category options
const categories = ["Semua", "Action", "Drama", "Komedi", "Horror", "Dokumenter"];

// TeraBox Video Data
const teraboxVideos = [
  {
    id: 1,
    title: "Aksi Pertempuran",
    description: "Film aksi dengan pertempuran seru dan efek visual memukau",
    year: "2023",
    category: "Action",
    posterUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900",
    videoUrl: "https://1024terabox.com/s/1V2r3jDURBk3YkmbqOZ-JwA",
    isFeatured: true,
  },
  {
    id: 2,
    title: "Misteri Pulau",
    description: "Petualangan mencari harta karun di pulau misterius",
    year: "2022",
    category: "Drama",
    posterUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900",
    videoUrl: "https://1024terabox.com/s/1V2r3jDURBk3YkmbqOZ-JwA",
  },
  {
    id: 3,
    title: "Komedi Kantoran",
    description: "Kisah lucu kehidupan di kantor dengan berbagai karakter unik",
    year: "2023",
    category: "Komedi",
    posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900",
    videoUrl: "https://1024terabox.com/s/1V2r3jDURBk3YkmbqOZ-JwA",
  },
  {
    id: 4,
    title: "Rumah Angker",
    description: "Kisah seram di rumah tua yang dihantui arwah penasaran",
    year: "2021",
    category: "Horror",
    posterUrl: "https://images.unsplash.com/photo-1626128665085-483747621778?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900",
    videoUrl: "https://1024terabox.com/s/1V2r3jDURBk3YkmbqOZ-JwA",
  },
  {
    id: 5,
    title: "Alam Liar",
    description: "Dokumenter tentang kehidupan hewan-hewan di alam liar Afrika",
    year: "2022",
    category: "Dokumenter",
    posterUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=900",
    videoUrl: "https://1024terabox.com/s/1V2r3jDURBk3YkmbqOZ-JwA",
  }
];

// Find featured video
const featuredVideo = teraboxVideos.find(video => video.isFeatured) || teraboxVideos[0];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [username, setUsername] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<typeof teraboxVideos[0] | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  
  // Get movies from server
  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
    initialData: teraboxVideos as unknown as Movie[],
  });
  
  useEffect(() => {
    // Get username from localStorage
    const currentUsername = getUsername();
    if (!currentUsername) {
      // If not authenticated, redirect to login
      navigate("/");
      return;
    }
    
    setUsername(currentUsername);
  }, [navigate]);
  
  // Handle logout
  const handleLogout = () => {
    clearAuthState();
    navigate("/");
  };
  
  // Handle play video
  const handlePlayVideo = (video: typeof teraboxVideos[0]) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };
  
  // Close video modal
  const handleCloseVideo = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
    setIsIframeLoaded(false);
  };
  
  // Filter movies by category
  const filteredMovies = activeCategory === "Semua"
    ? teraboxVideos
    : teraboxVideos.filter(movie => movie.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-netflix-black text-white">
      {isLoading && <Loader text="Memuat data film..." />}
      
      {/* Navbar */}
      <nav className="bg-netflix-black border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-extrabold text-primary logo-text">LUNAFLIX</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden sm:block">{username}</span>
              <Button 
                variant="ghost"
                className="text-gray-300 hover:text-white"
                onClick={handleLogout}
              >
                <LogOutIcon className="h-5 w-5 sm:mr-1" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Kategori Film</h2>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={
                  activeCategory === category
                    ? "px-4 py-2 bg-primary text-white rounded-full whitespace-nowrap"
                    : "px-4 py-2 bg-netflix-dark-gray text-gray-300 hover:bg-netflix-gray rounded-full whitespace-nowrap border-gray-700"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Featured Content */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden h-64 sm:h-80 md:h-96 bg-netflix-dark-gray">
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
            <img 
              src={featuredVideo.posterUrl}
              alt={featuredVideo.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <span className="bg-primary text-white text-xs px-2 py-1 rounded mb-2 inline-block">Premium</span>
              <h3 className="text-2xl font-bold text-white mb-1">{featuredVideo.title}</h3>
              <p className="text-gray-200 mb-4 max-w-lg">{featuredVideo.description}</p>
              <Button 
                onClick={() => handlePlayVideo(featuredVideo)}
                className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition duration-200 flex items-center hover-scale"
              >
                <PlayIcon className="h-5 w-5 mr-2" /> Tonton Sekarang
              </Button>
            </div>
          </div>
        </div>
        
        {/* Movies Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Koleksi TeraBox</h2>
            <div className="text-sm text-gray-400 flex items-center">
              <Info className="h-4 w-4 mr-1" /> 
              <span>https://1024terabox.com/s/1V2r3jDURBk3YkmbqOZ-JwA</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                title={movie.title}
                year={movie.year}
                category={movie.category}
                posterUrl={movie.posterUrl}
                onClick={() => handlePlayVideo(movie)}
                className="hover-scale cursor-pointer"
              />
            ))}
          </div>
        </div>
      </main>
      
      {/* Video Player Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 bg-black border-gray-800 overflow-hidden">
          <div className="relative w-full h-full aspect-video min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
            {selectedVideo && (
              <>
                {!isIframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-netflix-black z-10">
                    <Loader text="Memuat video dari TeraBox..." />
                    <p className="text-gray-400 text-sm mt-4 max-w-md text-center">
                      Sedang memuat video dari TeraBox. Harap tunggu sebentar...
                    </p>
                  </div>
                )}
                <iframe 
                  src={selectedVideo.videoUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  onLoad={() => setIsIframeLoaded(true)}
                  style={{ zIndex: isIframeLoaded ? 20 : 1 }}
                ></iframe>
                <Button 
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white rounded-full z-30"
                  size="icon"
                  variant="ghost"
                  onClick={handleCloseVideo}
                >
                  <X className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Header, DripClient } from "@/components";

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans">
      {/* Animated top border effect */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4a9eff] to-transparent opacity-60 z-50"></div>
      
      <main className="relative flex min-h-screen w-full flex-col items-center px-6 py-8 sm:px-8 md:px-12 lg:px-16 z-10">
        <div className="w-full max-w-7xl">
          <Header />
          
          {/* Hero Section */}
          <div className="mt-12 mb-16 text-center space-y-6">
            <div className="inline-block">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-br from-[#4a9eff] via-[#00d4ff] to-[#8b5cf6] bg-clip-text text-transparent mb-2 tracking-tight">
                D2 DRIP EXTRACTOR
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#4a9eff] to-transparent"></div>
            </div>
            
            <p className="text-lg sm:text-xl text-[#c5c5c5] max-w-3xl mx-auto leading-relaxed">
              Extract all of your Guardian's cosmetics — armor, shaders, and ornaments — 
              in an AI-readable format. Perfect for generating the ultimate drip with AI assistance.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <span className="px-4 py-2 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/30 text-[#4a9eff] text-sm font-medium">
                Armor Analysis
              </span>
              <span className="px-4 py-2 rounded-full bg-[#f4d03f]/10 border border-[#f4d03f]/30 text-[#f4d03f] text-sm font-medium">
                Shader Library
              </span>
              <span className="px-4 py-2 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-medium">
                Ornament Collection
              </span>
            </div>
          </div>
          
          <DripClient />
        </div>
      </main>
      
      {/* Bottom accent */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-40 z-50"></div>
    </div>
  );
}

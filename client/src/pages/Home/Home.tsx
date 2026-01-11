import { useState, useEffect } from "react";
import {
  Sparkles,
  GraduationCap,
  Mic,
  FileText,
  TrendingUp,
  Code,
  Pencil,
  MessageSquare,
  ArrowRight,
  Award,
  Target,
  Rocket,
} from "lucide-react";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const coreFeatures = [
    {
      icon: Sparkles,
      title: "3D Avatar AI Interview",
      description:
        "Practice interviews with realistic 3D avatars powered by AI in real-time",
      color: "#335441",
    },

    {
      icon: GraduationCap,
      title: "Smart Courses & Certification",
      description:
        "Enroll, learn, test, and get certified with AI-enhanced courses",
      color: "#335441",
    },
    {
      icon: Mic,
      title: "3D Podcast Studio",
      description: "Experience podcasts with immersive 3D AI models",
      color: "#46704A",
    },
    {
      icon: FileText,
      title: "Interview Resources",
      description: "Comprehensive materials to ace your next interview",
      color: "#46704A",
    },
    {
      icon: TrendingUp,
      title: "Industry Insights",
      description: "AI-powered analysis of current tech industry trends",
      color: "#6B8F60",
    },
    {
      icon: Code,
      title: "Company DSA Questions",
      description: "Practice company-specific data structures and algorithms",
      color: "#335441",
    },
    {
      icon: Pencil,
      title: "Voice Excalidraw",
      description: "Create diagrams using voice commands with AI assistance",
      color: "#46704A",
    },
    {
      icon: MessageSquare,
      title: "PDF Chatting",
      description: "Have intelligent conversations with your PDF documents",
      color: "#6B8F60",
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Personalized Learning",
      description: "AI adapts to your pace and style",
    },
    {
      icon: Rocket,
      title: "Career Acceleration",
      description: "Fast-track your professional growth",
    },
    {
      icon: Award,
      title: "Industry Recognition",
      description: "Earn certificates that matter",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F6EE]">
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-[#F9F6EE] to-[#EFE7D4]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A9B782] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#46704A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`transition-all duration-1000 ${isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
                }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#A9B782]/30 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#335441]" />
                <span className="text-sm font-medium text-[#335441]">
                  AI-Powered Learning Platform
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#335441] mb-6 leading-tight">
                Master Skills with
                <span className="block mt-2 bg-linear-to-r from-[#335441] to-[#6B8F60] bg-clip-text text-transparent">
                  AI Technology
                </span>
              </h1>

              <p className="text-xl text-[#3C6040] mb-8 leading-relaxed">
                From 3D avatar interviews to intelligent tutoring, experience
                the future of learning with our comprehensive AI-powered
                platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="group px-8 py-4 bg-[#335441] text-white rounded-lg font-semibold shadow-lg hover:bg-[#46704A] transition-all duration-300 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white text-[#335441] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#335441]">
                  Watch Demo
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-[#335441]">12+</div>
                  <div className="text-sm text-[#6B8F60]">AI Features</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#335441]">24/7</div>
                  <div className="text-sm text-[#6B8F60]">Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#335441]">100%</div>
                  <div className="text-sm text-[#6B8F60]">Interactive</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
                }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-[#335441] to-[#6B8F60] rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                    alt="AI Learning Platform"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-[#335441] to-[#46704A] rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#335441]">
                          AI Powered
                        </div>
                        <div className="text-xs text-[#6B8F60]">
                          Real-time Learning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#335441] mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-[#6B8F60] max-w-2xl mx-auto">
              Everything you need to accelerate your learning journey, all
              powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-linear-to-br from-[#F9F6EE] to-white rounded-2xl p-6 border-2 border-[#E4D7B4] hover:border-[#A9B782] transition-all duration-300 hover:shadow-xl"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#335441] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#6B8F60] leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 bg-linear-to-br from-[#335441] to-[#46704A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-[#E4D7B4]">
              Watch how our AI-powered platform transforms learning
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm border-4 border-white/20">
            <div className="aspect-video relative">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/m0as4uMox_U"
                title="PrepX Platform Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#335441] mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-[#6B8F60]">
              The smartest way to advance your career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-linear-to-br from-[#335441] to-[#6B8F60] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#335441] mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-[#6B8F60] text-lg">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-linear-to-br from-[#EFE7D4] to-[#E4D7B4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#335441] mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-[#3C6040] mb-10">
            Join thousands of learners transforming their careers with
            AI-powered education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 bg-[#335441] text-white rounded-lg font-bold text-lg shadow-xl hover:bg-[#46704A] transition-all duration-300 flex items-center justify-center gap-2">
              Get Started Now
              <Rocket className="w-5 h-5" />
            </button>
            <button className="px-10 py-5 bg-white text-[#335441] rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-[#335441]">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

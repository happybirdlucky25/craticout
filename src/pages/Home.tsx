import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/Skeleton";
import { useAppStore } from "@/store";
import { Search, FileText, Users, TrendingUp } from "lucide-react";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Track Legislative Activity with AI-Powered Insights
        </h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Stay informed about bills, generate comprehensive reports, and monitor legislators with our advanced political intelligence platform.
        </p>
        <Button 
          size="lg" 
          variant="secondary"
          onClick={() => navigate("/search")}
          className="text-lg px-8 py-3"
        >
          Start Exploring
        </Button>
      </div>
    </div>
  );
};

const HowItWorksCards = () => {
  const cards = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Search & Track",
      description: "Find bills by topic, sponsor, or keyword across all 50 states and federal Congress."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "AI Reports",
      description: "Generate detailed analyses including fiscal impact, public opinion, and strategic recommendations."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Monitor Activity",
      description: "Track legislator voting patterns and receive alerts on bills you care about."
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How ShadowCongress Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4 text-blue-600">
                  {card.icon}
                </div>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrendingBills = () => {
  const { bills, loading } = useAppStore();
  const navigate = useNavigate();

  // Mock trending bills for now
  const trendingBills = [
    {
      id: "1",
      title: "Infrastructure Investment and Jobs Act",
      status: "Passed",
      sponsor: "Rep. Johnson",
      summary: "Bipartisan legislation investing in America's infrastructure including roads, bridges, broadband, and clean energy.",
      chamber: "house" as const,
      state: "Federal",
      session: "118th Congress"
    },
    {
      id: "2", 
      title: "Climate Action and Green Jobs Bill",
      status: "In Committee",
      sponsor: "Sen. Williams",
      summary: "Comprehensive climate legislation promoting renewable energy transition and creating green collar jobs.",
      chamber: "senate" as const,
      state: "Federal", 
      session: "118th Congress"
    },
    {
      id: "3",
      title: "Education Funding Reform Act",
      status: "Under Review",
      sponsor: "Rep. Davis",
      summary: "Modernizes education funding formulas and increases support for underserved communities.",
      chamber: "house" as const,
      state: "Federal",
      session: "118th Congress"
    },
    {
      id: "4",
      title: "Healthcare Access Expansion",
      status: "Introduced",
      sponsor: "Sen. Thompson",
      summary: "Expands healthcare access and reduces prescription drug costs for seniors and families.",
      chamber: "senate" as const,
      state: "Federal",
      session: "118th Congress"
    }
  ];

  if (loading.bills) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trending Bills</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <TrendingUp className="h-8 w-8 mr-3 text-blue-600" />
          <h2 className="text-3xl font-bold">Trending Bills</h2>
        </div>
        
        {trendingBills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No trending bills today.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {trendingBills.map((bill) => (
              <Card 
                key={bill.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/bills/${bill.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-lg">{bill.title}</CardTitle>
                    <Badge variant="secondary">{bill.status}</Badge>
                  </div>
                  <CardDescription>
                    {bill.sponsor} • {bill.chamber} • {bill.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {bill.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TestimonialsCarousel = () => {
  const testimonials = [
    {
      quote: "ShadowCongress has transformed how our organization tracks legislative activity. The AI reports save us hours of research.",
      author: "Sarah Mitchell",
      title: "Policy Director, Public Interest Group"
    },
    {
      quote: "The real-time alerts and comprehensive bill tracking have made me a more informed and effective advocate.",
      author: "Michael Chen",
      title: "Legislative Affairs Manager"
    },
    {
      quote: "Finally, a tool that makes complex legislative data accessible and actionable for our campaign strategy.",
      author: "Jennifer Rodriguez",
      title: "Campaign Manager"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted by Policy Professionals</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <blockquote className="text-lg mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-muted-foreground">{testimonial.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <HowItWorksCards />
      <TrendingBills />
      <TestimonialsCarousel />
    </div>
  );
};

export default Home;
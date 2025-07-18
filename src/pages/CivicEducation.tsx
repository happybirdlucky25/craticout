import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { 
  FileText, 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  Share2, 
  Search,
  Calendar,
  BookOpen,
  BarChart3,
  ExternalLink,
  ChevronDown,
  Vote,
  Heart,
  Target,
  Lightbulb,
  PlayCircle,
  Trophy
} from "lucide-react";

const CivicEducation = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const usStates = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
  ];

  const civicFaqs = [
    {
      id: "bill",
      icon: FileText,
      question: "What is a bill?",
      answer: "A bill is a proposed law introduced in Congress. It can originate in either the House or Senate and must be passed by both chambers before becoming law. Bills cover everything from federal spending to new regulations and policy changes."
    },
    {
      id: "law",
      icon: Building2,
      question: "How does a bill become a law?",
      answer: "A bill goes through several steps: introduction, committee review, floor votes in both chambers, and finally presidential signature. If the president vetoes it, Congress can override with a two-thirds majority in both houses."
    },
    {
      id: "chambers",
      icon: Users,
      question: "What's the role of the House/Senate?",
      answer: "The House (435 members, 2-year terms) represents population-based districts and initiates spending bills. The Senate (100 members, 6-year terms) represents states equally and confirms presidential appointments. Both must approve legislation."
    },
    {
      id: "citizens",
      icon: Heart,
      question: "What can citizens do?",
      answer: "Citizens can vote, contact representatives, attend town halls, submit public comments on regulations, participate in protests, volunteer for campaigns, and stay informed about issues that matter to them."
    }
  ];

  const actionCards = [
    {
      icon: Phone,
      title: "Contact Your Legislator",
      description: "Find and reach out to your representatives",
      action: "Find My Legislator",
      link: "/legislators"
    },
    {
      icon: Mail,
      title: "Write a Letter",
      description: "Use templates to write effective letters",
      action: "Get Writing Tips",
      link: "#"
    },
    {
      icon: Share2,
      title: "Share on Social Media",
      description: "Amplify important issues online",
      action: "Get Sample Posts",
      link: "#"
    }
  ];

  const toolboxItems = [
    {
      icon: Search,
      title: "Find My Legislator",
      description: "Search by zip code or address",
      type: "page",
      link: "/legislators"
    },
    {
      icon: Lightbulb,
      title: "Bill Summary Tool",
      description: "AI-powered bill explanations",
      type: "modal",
      link: "#"
    },
    {
      icon: Calendar,
      title: "Election Calendar",
      description: "Important dates and deadlines",
      type: "modal",
      link: "#"
    },
    {
      icon: BookOpen,
      title: "How to Read a Bill",
      description: "Understanding legislative language",
      type: "modal",
      link: "#"
    },
    {
      icon: BarChart3,
      title: "Understanding Voting Records",
      description: "How to interpret legislator votes",
      type: "modal",
      link: "#"
    }
  ];

  const handleRegisterToVote = () => {
    if (selectedState) {
      window.open(`https://vote.gov/register/${selectedState.toLowerCase().replace(' ', '-')}/`, '_blank');
    } else {
      window.open('https://vote.gov/', '_blank');
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Dashboard</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Civic Hub</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Civic Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how government works, discover your role as a citizen, and get the tools you need to make your voice heard in democracy.
          </p>
        </div>

        {/* Desktop: Multi-column layout, Mobile: Stacked sections */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Civic Education Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Civic Education Basics
                </CardTitle>
                <CardDescription>
                  Essential knowledge every citizen should know
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {civicFaqs.map((faq) => (
                  <Collapsible
                    key={faq.id}
                    open={openFaq === faq.id}
                    onOpenChange={() => toggleFaq(faq.id)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <faq.icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3">
                      <p className="text-gray-600 mt-2 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Register to Vote */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Register to Vote
                </CardTitle>
                <CardDescription>
                  Make sure your voice is heard in elections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your State</label>
                  <Select onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {usStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleRegisterToVote} 
                  className="w-full"
                  disabled={!selectedState}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Register to Vote
                </Button>
                <p className="text-xs text-gray-500">
                  Links to official vote.gov registration portal
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* How to Take Action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  How to Take Action
                </CardTitle>
                <CardDescription>
                  Make your voice heard on the issues you care about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionCards.map((card, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <card.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{card.title}</h4>
                        <p className="text-sm text-gray-600">{card.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={card.link}>
                        {card.action}
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Toolbox / Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Civic Toolbox
                </CardTitle>
                <CardDescription>
                  Interactive tools to help you engage effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {toolboxItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-gray-600" />
                        <div>
                          <span className="font-medium text-sm">{item.title}</span>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.type === 'page' ? 'Page' : 'Tool'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Full-width Bonus Features */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          
          {/* Civic 101 Video Series */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Civic 101 Video Series
              </CardTitle>
              <CardDescription>
                Interactive video lessons on how government works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PlayCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Coming Soon</p>
                  <p className="text-sm">Civic 101 Video Series</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" disabled>
                Browse Video Library
              </Button>
            </CardContent>
          </Card>

          {/* Gamified Quiz */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                What Kind of Advocate Are You?
              </CardTitle>
              <CardDescription>
                Discover your civic engagement style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <h4 className="font-semibold mb-2">Civic Personality Quiz</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Take our interactive quiz to discover how you can best make a difference in your community.
                </p>
                <Button disabled>
                  Take the Quiz
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Interactive quiz coming soon
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Call to Action */}
        <div className="text-center bg-blue-50 rounded-lg p-8 mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Get Involved?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Now that you understand how government works, explore ShadowCongress to track bills, 
            follow legislators, and stay informed about the issues that matter to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <a href="/legislators">Find My Legislators</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/search">Search Bills</a>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CivicEducation;
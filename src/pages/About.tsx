const About = () => {
  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Dashboard</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">About Us</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About Us</h1>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              ShadowCongress is a comprehensive legislative intelligence platform designed to empower policy professionals, advocacy organizations, and engaged citizens with real-time insights into legislative activity across federal and state governments. Our mission is to democratize access to political intelligence by transforming complex legislative data into actionable insights that drive informed decision-making.
            </p>

            <p>
              We maintain a strictly nonpartisan approach to legislative tracking and analysis. Our platform serves users across the political spectrum by providing objective, fact-based reporting on bills, votes, committee actions, and legislator activities. We believe that transparent access to legislative information strengthens democratic participation and enables more effective advocacy, regardless of political affiliation or policy position.
            </p>

            <p>
              As a civic technology company, we're committed to leveraging cutting-edge AI and data analytics to bridge the gap between complex governmental processes and the citizens, organizations, and professionals who need to understand them. Our vision is a more informed democracy where legislative intelligence is accessible, timely, and actionable for everyone who seeks to engage with the political process.
            </p>
          </div>

          {/* Future sections placeholders */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Team</h3>
                <p className="text-gray-600 text-sm">
                  Team information coming soon.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Updates</h3>
                <p className="text-gray-600 text-sm">
                  Blog and company updates coming soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
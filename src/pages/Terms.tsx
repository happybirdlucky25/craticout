const Terms = () => {
  const lastUpdated = "January 17, 2025";

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
              <span className="text-gray-900">Terms of Service</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using ShadowCongress, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                ShadowCongress is a legislative intelligence platform that provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Real-time legislative tracking and alerts</li>
                <li>AI-powered analysis of bills and voting patterns</li>
                <li>Legislator profiles and activity monitoring</li>
                <li>Campaign management and advocacy tools</li>
                <li>Data export and reporting capabilities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To access certain features, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use ShadowCongress to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Distribute malware or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the platform for automated data scraping</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The platform and its content are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data and Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your use of ShadowCongress is also governed by our Privacy Policy, which explains how we collect, use, and protect your information. By using our platform, you consent to the collection and use of information as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Subscription and Billing</h2>
              <p className="text-gray-700 mb-4">
                Certain features may require a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Pay all fees according to your chosen plan</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Our refund policy as outlined in your subscription terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                ShadowCongress is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of legislative information, and users should verify all information independently.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Franklin Graystone LLC and ShadowCongress shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Email: legal@shadowcongress.com</li>
                <li>Contact form: <a href="/contact" className="text-blue-600 hover:underline">shadowcongress.com/contact</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
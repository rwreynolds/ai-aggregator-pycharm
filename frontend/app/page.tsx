import Link from 'next/link';

export const metadata = {
  title: 'AI Services Aggregator - Home',
  description: 'Access multiple AI services in one unified interface',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">AI Services Aggregator</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            One Platform, Multiple AI Services
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Access OpenAI, Claude, Grok, and other AI models in a single,
            unified conversation thread. Switch between services seamlessly
            and maintain context across models.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-50"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div id="features" className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Multiple AI Services</h3>
            <p className="text-gray-600">
              Connect to OpenAI, Anthropic Claude, Grok, and more, all from a single interface.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Unified Conversation</h3>
            <p className="text-gray-600">
              Keep your entire conversation history intact, even when switching between different models.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Customizable Settings</h3>
            <p className="text-gray-600">
              Adjust temperature, max tokens, and other parameters for each model to get the best results.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} AI Services Aggregator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
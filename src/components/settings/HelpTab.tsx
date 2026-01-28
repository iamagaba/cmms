import { AlertCircle, Check, Info } from 'lucide-react';
import React, { useState } from 'react';



// Help Article Data
const articles = [
    {
        id: 'intro',
        title: 'Introduction to Diagnostics',
        icon: 'tabler:info-circle',
        content: (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">What is the Diagnostic Feature?</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    The Diagnostic feature is a powerful tool designed to standardize vehicle troubleshooting.
                    It turns expert knowledge into an easy-to-follow, step-by-step guide for technicians of all skill levels.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Instead of guessing, a technician starts a "Diagnostic Session" for a specific bike issue (e.g., "Motor making noise").
                    The app then asks them a series of targeted questions to narrow down the problem until a specific solution is identified.
                </p>

                <div className="bg-muted dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2">
                        <Idea01Icon className="w-5 h-5" />
                        Why use it?
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li><strong>Consistency:</strong> Ensure every bike is checked the same way, regardless of who is working on it.</li>
                        <li><strong>Speed:</strong> Reduce "tinkering" time by guiding techs directly to the likely cause.</li>
                        <li><strong>Training:</strong> Junior technicians learn the logical troubleshooting steps just by using the tool.</li>
                        <li><strong>Data:</strong> Track which parts fail most often based on the solutions reached.</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'concepts',
        title: 'Core Concepts',
        icon: 'tabler:school',
        content: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">How the Logic Works</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                        The system works like a decision tree. It is built from three main building blocks:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center mb-3">
                            <Info className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Questions</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            The checkpoints. e.g., "Does the battery show &gt; 60V?" or "Is the controller light blinking?"
                        </p>
                    </div>

                    <div className="p-4 bg-card rounded-lg border shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                            <List className="w-6 h-4" />
                        </div>
                        <h4 className="font-bold mb-1">Options</h4>
                        <p className="text-sm text-muted-foreground">
                            The possible answers. e.g., "Yes", "No", "Intermittently". Each option directs the flow to a new path.
                        </p>
                    </div>

                    <div className="p-4 bg-card rounded-lg border shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-3">
                            <Check className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold mb-1">Solutions</h4>
                        <p className="text-sm text-muted-foreground">
                            The end of the line. A clear instruction on what to fix. e.g., "Replace DC-DC Converter".
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Example Flow</h4>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full">Bike won't start</span>
                        <ChevronRight className="text-gray-400 w-4 h-4" />
                        <span className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600">Check Voltage</span>
                        <ChevronRight className="text-gray-400 w-4 h-4" />
                        <span className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-600">Voltage is 0V</span>
                        <ChevronRight className="text-gray-400 w-4 h-4" />
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">Replace Battery Fuse</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'guide',
        title: 'Configuration Guide',
        icon: 'tabler:settings-2',
        content: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">How to Configure Diagnostics</h3>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                        Go to the <strong>Configuration</strong> tab in Settings to start building your flows.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Create Categories</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                First, organize your questions. Create categories like "Motor", "Battery", "Brakes".
                                This helps technicians find the right starting point for their issue.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Add the First Question</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Every category needs an entry point. Create a question and give it the specific ID <code>START</code>.
                                This is where the app knows to begin when a user selects that category.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Define Options & Routing</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                For each question, add "Options" (the buttons the user will click). For each option, you choose what happens next:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><strong>Link to Question:</strong> Select an existing question ID to continue the flow.</li>
                                <li><strong>Mark as Solution:</strong> Choose this if this answer identifies the problem. You can then write out the fix instructions.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h5 className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Important Note on IDs
                    </h5>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Use unique, readable IDs for questions (e.g. <code>BATTERY_VOLT_CHECK</code>).
                        This makes it much easier to link them together than random numbers.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'visualizer',
        title: 'Using the Visualizer',
        icon: 'tabler:hierarchy-2',
        content: (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">The Flow Visualizer</h3>
                <p className="text-gray-700 dark:text-gray-300">
                    It can be hard to keep a complex logic tree in your head. The <strong>Flow Visualizer</strong> draws it for you.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold mb-2">How to access</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            In the Configuration tab, click the "Flow Visualizer" toggle at the top right.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold mb-2">What to look for</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                            <li>Dead ends (questions with no options).</li>
                            <li>Broken links (options pointing to non-existent IDs).</li>
                            <li>Circular loops (A -&gt; B -&gt; A).</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
];

const HelpTab = () => {
    const [activeArticleId, setActiveArticleId] = useState('intro');

    const activeArticle = articles.find(a => a.id === activeArticleId) || articles[0];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
                {articles.map(article => (
                    <button
                        key={article.id}
                        onClick={() => setActiveArticleId(article.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeArticleId === article.id
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900'
                            }`}
                    >
                        {/* TODO: Convert article.icon prop to use HugeiconsIcon component */}
                        {article.title}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {activeArticle.content}
                </div>
            </div>
        </div>
    );
};

export default HelpTab;





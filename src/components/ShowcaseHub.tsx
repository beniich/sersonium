import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Smartphone, Sparkles, Banana, ArrowRight, Lock } from 'lucide-react';

interface ShowcaseHubProps {
  onSelectTheme: (themeId: string) => void;
  onEnterDashboard: () => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
}

const SHOWCASES = [
  {
    id: 'architecture',
    name: 'Spider CAFM',
    description: 'Autonomous Digital Twin & Predictive Facility Intelligence',
    icon: Building2,
    color: 'from-indigo-600 to-purple-700',
    bg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800'
  },
  {
    id: 'lacaza',
    name: 'Lacaza OS',
    description: 'Manage your assets. Simplify IT. (Xiaomi Edition)',
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-700',
    bg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'sensorium',
    name: 'Sensorium',
    description: 'Sensory Biometric Intelligence & Elegance',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-700',
    bg: 'bg-amber-50/50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800'
  },
  {
    id: 'nanobanana',
    name: 'Nano Banana',
    description: 'Playful, Fast & Lightweight Workflow Management',
    icon: Banana,
    color: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-50/50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800'
  }
];

export const ShowcaseHub: React.FC<ShowcaseHubProps> = ({
  onSelectTheme,
  onEnterDashboard,
  isAuthenticated,
  onSignIn
}) => {
  const handleAction = (themeId: string) => {
    // Navigate to the specific hero/landing page
    onSelectTheme(themeId);
  };

  const handleEnterApp = () => {
    if (!isAuthenticated) {
      onSignIn();
    } else {
      onEnterDashboard();
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Experience</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Select a product showcase to explore its unique capabilities, or verify your access to enter the centralized application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-16">
        {SHOWCASES.map((showcase, index) => {
          const Icon = showcase.icon;
          return (
            <motion.div
              key={showcase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() => handleAction(showcase.id)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${showcase.bg} ${showcase.border}`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${showcase.color}`} />
              
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${showcase.color} shadow-lg text-white`}>
                <Icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {showcase.name}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {showcase.description}
              </p>
              
              <div className="flex items-center text-sm font-semibold mt-auto group-hover:text-blue-600 transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center p-8 bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-md w-full"
      >
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Central Application</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
          {isAuthenticated 
            ? "Your access is verified. You can now enter the master control panel." 
            : "Secure access verification required to enter the main application."}
        </p>
        
        <button
          onClick={handleEnterApp}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {isAuthenticated ? (
            <>
              Enter Application
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Verify Access & Login
              <Lock className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

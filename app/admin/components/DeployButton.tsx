"use client";

import { useState } from "react";
import { Loader2, Rocket, HelpCircle } from "lucide-react";

export function DeployButton() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        "https://api.vercel.com/v1/integrations/deploy/prj_iD7AXotJ4eHCL1GiJM1c8JcKd3XB/vnqCrLJJO1",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(`Deploy failed: ${response.statusText}`);
      }

      setSuccess(true);
    } catch (error) {
      console.error("Deploy failed:", error);
      setError(error instanceof Error ? error.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-left text-lg font-medium text-gray-900">
              Deploy to Production
            </h3>
            <div className="mt-1 flex items-center space-x-2">
              <p className="text-sm text-gray-500">
                Deploy your changes to the live website
              </p>
              <div className="group relative">
                <HelpCircle
                  size={16}
                  className="text-gray-400 hover:text-gray-600"
                />
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-[300px] -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white group-hover:block">
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  <div className="max-w-xs">
                    This will deploy your latest changes to the production
                    environment. The process usually takes 1-2 minutes to
                    complete.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="inline-flex items-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy to Vercel
              </>
            )}
          </button>
        </div>
      </div>
      <div className="space-y-4 p-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            Deployment started successfully! Your changes will be live in a few
            minutes. For more details, check the{" "}
            <a
              href="https://vercel.com/damngood/sugarlift/deployments"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel dashboard
            </a>
            .
          </div>
        )}

        {isDeploying && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            Deploying your changes to production. This usually takes 1-2
            minutes...
          </div>
        )}
      </div>
    </div>
  );
}

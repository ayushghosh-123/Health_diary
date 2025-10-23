'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ConfigStatus {
  supabase: boolean;
  clerk: boolean;
  database: boolean;
}

export function ConfigCheck() {
  const [config, setConfig] = useState<ConfigStatus>({
    supabase: false,
    clerk: false,
    database: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

      const supabaseConfigured = !!(supabaseUrl && supabaseKey && 
        !supabaseUrl.includes('your') && !supabaseKey.includes('your'));
      const clerkConfigured = !!(clerkKey && !clerkKey.includes('your'));

      // Test database connection
      let databaseConnected = false;
      if (supabaseConfigured) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl!, supabaseKey!);
          const { error } = await supabase.from('health_entries').select('count').limit(1);
          databaseConnected = !error;
        } catch (error) {
          console.error('Database connection test failed:', error);
        }
      }

      setConfig({
        supabase: supabaseConfigured,
        clerk: clerkConfigured,
        database: databaseConnected,
      });
      setLoading(false);
    };

    checkConfig();
  }, []);

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Configuration Check
          </CardTitle>
          <CardDescription>Checking your setup...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const allConfigured = config.supabase && config.clerk && config.database;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Configuration Check
        </CardTitle>
        <CardDescription>
          {allConfigured 
            ? 'All systems are configured correctly!' 
            : 'Please complete the setup to use the application.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Supabase Configuration</span>
          <Badge variant={config.supabase ? 'default' : 'destructive'}>
            {config.supabase ? 'Configured' : 'Missing'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Clerk Authentication</span>
          <Badge variant={config.clerk ? 'default' : 'destructive'}>
            {config.clerk ? 'Configured' : 'Missing'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Database Connection</span>
          <Badge variant={config.database ? 'default' : 'destructive'}>
            {config.database ? 'Connected' : 'Failed'}
          </Badge>
        </div>

        {!allConfigured && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
            <p className="text-sm text-yellow-700 mb-2">
              Please check the SETUP.md file for detailed instructions on configuring your environment.
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              {!config.supabase && <li>• Configure Supabase URL and API key in .env.local</li>}
              {!config.clerk && <li>• Configure Clerk publishable key in .env.local</li>}
              {!config.database && <li>• Run the database schema in Supabase</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

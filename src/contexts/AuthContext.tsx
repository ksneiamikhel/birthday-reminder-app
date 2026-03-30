import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  gitHubToken: string | null;
  gitHubUsername: string | null;
  gitHubRepo: string | null;
  signIn: (token: string, username: string, repo: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gitHubToken, setGitHubToken] = useState<string | null>(null);
  const [gitHubUsername, setGitHubUsername] = useState<string | null>(null);
  const [gitHubRepo, setGitHubRepo] = useState<string | null>(null);

  // Check if credentials are in .env on mount
  useEffect(() => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const username = import.meta.env.VITE_GITHUB_USERNAME;
    const repo = import.meta.env.VITE_GITHUB_REPO;

    if (token && username && repo) {
      setGitHubToken(token);
      setGitHubUsername(username);
      setGitHubRepo(repo);
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const signIn = (token: string, username: string, repo: string) => {
    setGitHubToken(token);
    setGitHubUsername(username);
    setGitHubRepo(repo);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setGitHubToken(null);
    setGitHubUsername(null);
    setGitHubRepo(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        gitHubToken,
        gitHubUsername,
        gitHubRepo,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

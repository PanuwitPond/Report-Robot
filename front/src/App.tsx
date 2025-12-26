import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, DomainProvider } from './contexts';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <DomainProvider>
                    <ErrorBoundary>
                        <AppRoutes />
                    </ErrorBoundary>
                </DomainProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

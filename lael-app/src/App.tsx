import { AppRouter } from '@/routes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/providers/Toaster';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster />
        <AppRouter />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

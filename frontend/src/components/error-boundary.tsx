import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console (could be sent to an error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen workcodile-bg flex items-center justify-center p-4">
                    <Card className="glass-card max-w-md w-full shadow-modern-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">¡Ups! Algo salió mal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-center">
                                Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
                            </p>

                            {/* Error details (only in development) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-auto max-h-32">
                                    <p className="text-destructive font-semibold mb-1">
                                        {this.state.error.name}: {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <pre className="text-muted-foreground whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={this.handleRetry}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reintentar
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="default"
                                    className="flex-1"
                                >
                                    <Home className="h-4 w-4 mr-2" />
                                    Ir al inicio
                                </Button>
                            </div>

                            <Button
                                onClick={this.handleReload}
                                variant="ghost"
                                className="w-full text-muted-foreground"
                            >
                                Recargar página
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

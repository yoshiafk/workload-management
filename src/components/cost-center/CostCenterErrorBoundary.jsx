/**
 * Cost Center Error Boundary
 * Specialized error boundary for cost center management components
 */

import { Component } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { toast } from "sonner";

class CostCenterErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        
        // Log error with cost center context
        console.error('Cost Center Error Boundary caught an error:', {
            error,
            errorInfo,
            component: this.props.componentName || 'Unknown',
            timestamp: new Date().toISOString()
        });

        // Show toast notification
        toast.error(`Cost center operation failed: ${error.message}`);
    }

    handleRetry = () => {
        const newRetryCount = this.state.retryCount + 1;
        
        // Limit retry attempts
        if (newRetryCount > 3) {
            toast.error('Maximum retry attempts reached. Please refresh the page.');
            return;
        }

        this.setState({ 
            hasError: false, 
            error: null, 
            errorInfo: null,
            retryCount: newRetryCount
        });

        toast.info(`Retrying... (${newRetryCount}/3)`);
    };

    handleGoHome = () => {
        window.location.href = '/workload-management/';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isDataError = this.state.error?.message?.includes('validation') || 
                               this.state.error?.message?.includes('required') ||
                               this.state.error?.message?.includes('unique');
            
            const isNetworkError = this.state.error?.message?.includes('network') ||
                                  this.state.error?.message?.includes('fetch');

            return (
                <div className="library-page space-y-6 animate-in fade-in duration-500">
                    <Card className="p-8 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    Cost Center Error
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                    {isDataError && "There was a validation error with the cost center data."}
                                    {isNetworkError && "There was a network error while processing the request."}
                                    {!isDataError && !isNetworkError && "An unexpected error occurred in the cost center management system."}
                                </p>
                                
                                {this.props.showErrorDetails && (
                                    <details className="mt-4 text-left">
                                        <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                                            Technical Details
                                        </summary>
                                        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
                                            <div className="text-red-600 dark:text-red-400 mb-2">
                                                {this.state.error?.message}
                                            </div>
                                            {this.state.errorInfo?.componentStack && (
                                                <div className="text-slate-600 dark:text-slate-400">
                                                    {this.state.errorInfo.componentStack}
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                    onClick={this.handleRetry}
                                    className="flex items-center gap-2"
                                    disabled={this.state.retryCount >= 3}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    {this.state.retryCount >= 3 ? 'Max Retries Reached' : `Retry (${this.state.retryCount}/3)`}
                                </Button>
                                
                                <Button 
                                    variant="outline"
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Go to Dashboard
                                </Button>
                                
                                <Button 
                                    variant="ghost"
                                    onClick={this.handleReload}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reload Page
                                </Button>
                            </div>

                            {this.props.fallbackComponent && (
                                <div className="mt-6 w-full">
                                    <h3 className="text-lg font-semibold mb-3">Alternative Actions</h3>
                                    {this.props.fallbackComponent}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default CostCenterErrorBoundary;
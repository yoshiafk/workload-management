import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlurFade, FadeIn } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoLogin = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
            {/* Subtle Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Gradient Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-100/50 to-transparent rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
                <BlurFade delay={0.1}>
                    <Card className="border-slate-200/80 shadow-xl shadow-slate-200/50">
                        <CardHeader className="text-center pb-2">
                            <FadeIn delay={0.2}>
                                {/* Logo */}
                                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <BarChart3 className="h-7 w-7 text-white" />
                                </div>
                            </FadeIn>
                            <FadeIn delay={0.25}>
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    Workload Resource Manager
                                </CardTitle>
                            </FadeIn>
                            <FadeIn delay={0.3}>
                                <CardDescription className="text-slate-500">
                                    Sign in to manage your team's workload
                                </CardDescription>
                            </FadeIn>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <FadeIn delay={0.35}>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-700">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-11 bg-white border-slate-200 focus:border-indigo-300"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.4}>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-slate-700">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 pr-10 h-11 bg-white border-slate-200 focus:border-indigo-300"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </FadeIn>

                                <FadeIn delay={0.45}>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="h-4 w-4" />
                                                Sign In
                                            </>
                                        )}
                                    </Button>
                                </FadeIn>
                            </form>
                        </CardContent>

                        <CardFooter className="flex-col gap-4 pt-0">
                            <FadeIn delay={0.5}>
                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-3 text-xs text-slate-400 font-medium">
                                            Demo Credentials
                                        </span>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.55}>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDemoLogin('admin@example.com', 'admin123')}
                                        className="h-auto py-3 flex-col items-start border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                                    >
                                        <span className="font-semibold text-indigo-600">Admin</span>
                                        <span className="text-[10px] text-slate-400 font-normal">admin@example.com</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDemoLogin('member@example.com', 'password123')}
                                        className="h-auto py-3 flex-col items-start border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                                    >
                                        <span className="font-semibold text-emerald-600">Member</span>
                                        <span className="text-[10px] text-slate-400 font-normal">member@example.com</span>
                                    </Button>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.6}>
                                <p className="text-center text-xs text-slate-400 mt-2">
                                    © 2026 WRM System. All rights reserved.
                                </p>
                            </FadeIn>
                        </CardFooter>
                    </Card>
                </BlurFade>
            </div>
        </div>
    );
};

export default LoginPage;

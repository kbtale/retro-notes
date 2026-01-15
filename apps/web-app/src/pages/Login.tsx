import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/8bit/card';
import { Input } from '@/components/ui/8bit/input';
import { Button } from '@/components/ui/8bit/button';
import { Alert, AlertDescription } from '@/components/ui/8bit/alert';

interface LocationState {
    from?: { pathname: string };
}

export function LoginPage(): ReactNode {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuthActions();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard';

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch {
            setError('Invalid username or password');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">RetroNotes</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="retro text-sm">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="retro text-sm">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 w-full"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

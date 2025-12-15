import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts';
import { Button, Input } from '@/components/ui';
import './SignInPage.css';

interface SignInForm {
    username: string;
    password: string;
}

export const SignInPage = () => {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>();

    const onSubmit = async (data: SignInForm) => {
        try {
            setError('');
            setIsLoading(true);
            await login(data.username, data.password);
            window.location.href = '/export-report';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <div className="signin-card">
                    <h1 className="signin-title">AI Report System</h1>
                    <p className="signin-subtitle">Sign in to your account</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="signin-form">
                        <Input
                            label="Username"
                            type="text"
                            {...register('username', { required: 'Username is required' })}
                            error={errors.username?.message}
                            placeholder="Enter your username"
                        />

                        <Input
                            label="Password"
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            error={errors.password?.message}
                            placeholder="Enter your password"
                        />

                        {error && <div className="signin-error">{error}</div>}

                        <Button type="submit" disabled={isLoading} className="signin-button">
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

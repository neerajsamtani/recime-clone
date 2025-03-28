import { LoginButton } from "@/components/auth/login-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Sign in to your account
                    </CardTitle>
                    <CardDescription>
                        Get started with recipe management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginButton />
                </CardContent>
            </Card>
        </div>
    );
} 
import { login, signup } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <form className='flex flex-col gap-4'>
                <Label htmlFor="email">Email:</Label>
                <Input id="email" name="email" type="email" required />
                <Label htmlFor="password">Password:</Label>
                <Input id="password" name="password" type="password" required />
                <Button formAction={login}>Log in</Button>
                <Button formAction={signup}>Sign up</Button>
            </form>
        </main>
    )
}
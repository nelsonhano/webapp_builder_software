import SaasLogo from '@/components/SaasLogo'
import { Button } from '@/components/ui/button'
import { SignedIn, UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Link from 'next/link'
import React from 'react'

type Props = {
    user?: null | User
}

export default function NavBar({ user}: Props) {
return (
    <div className='p-4 flex items-center justify-between relative'>
        <aside className='flex items-center justify-self-start gap-2'>
            <div>
                <SaasLogo />
            </div>
            <span className='text-xl font-bold'>Plura</span>
        </aside>

        <nav className='hidden md:flex left-[50%] top[50%] transform translate-x-[-50%] translate-y-[-50%]'>
            <ul className='flex items-center justify-center gap-8'>
                <Link   href={"#"}>Pricing</Link>
                <Link   href={"#"}>About</Link>
                <Link   href={"#"}>Documentation</Link>
                <Link   href={"#"}>Feature</Link>
            </ul>
        </nav>

        <aside className='justify-self-end gap-2 flex flex-row'>
            <Button asChild>
                <Link href="/agency">Sign In</Link>
            </Button>
            <SignedIn>
                <UserButton />
            </SignedIn>
            <Button>Theme</Button>
        </aside>
    </div>
)}

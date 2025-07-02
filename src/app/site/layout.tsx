import NavBar from '@/components/site/navigation/NavBar';
import { ReactNode } from 'react';

export default function layout({ children }: { children: ReactNode }) {
return (
    <div className='flex flex-col relative w-full h-screen'>
        <NavBar />

        <div>
            {children}
        </div>
    </div>
)};

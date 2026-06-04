import { Link } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">
                    Crypto<span className="text-green-400">Tracker</span>
                </span>
            </Link>

            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl px-8 py-8">
                {children}
            </div>
        </div>
    );
}


import { Link } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                            <span className="text-lg font-bold text-white">Crypto<span className="text-green-400">Tracker</span></span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Track live cryptocurrency prices, market cap, charts, and more.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <h4 className="text-white font-semibold mb-3">Markets</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/coins" className="hover:text-white transition-colors">All Cryptocurrencies</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">Data</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="https://www.coingecko.com/en/api" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Powered by CoinGecko</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">
                    © {new Date().getFullYear()} CryptoTracker. Data provided by CoinGecko API.
                </div>
            </div>
        </footer>
    );
}

import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Menu, Search, TrendingUp, X } from 'lucide-react';

export default function Navbar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.get(`/_api/search?q=${encodeURIComponent(query)}`);
                setResults(data.coins?.slice(0, 8) || []);
                setShowResults(true);
            } catch {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function handleClick(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }

        document.addEventListener('mousedown', handleClick);

        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleSelect(coin) {
        setQuery('');
        setShowResults(false);
        setMenuOpen(false);
        router.visit(`/coins/${coin.id}`);
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <TrendingUp className="w-7 h-7 text-green-400" />
                        <span className="text-xl font-bold text-white">
                            Crypto<span className="text-green-400">Tracker</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Home</Link>
                        <Link href="/coins" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Cryptocurrencies</Link>
                        <Link href="/stocks" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">TSX Stocks</Link>
                    </div>

                    <div ref={searchRef} className="relative w-72 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search coins..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setShowResults(false);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                                </button>
                            )}
                        </div>
                        {showResults && results.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                                {results.map((coin) => (
                                    <button
                                        key={coin.id}
                                        type="button"
                                        onClick={() => handleSelect(coin)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{coin.name}</p>
                                            <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                                        </div>
                                        <span className="ml-auto text-xs text-gray-500">#{coin.market_cap_rank}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((value) => !value)}
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link href="/" className="block px-2 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link href="/coins" className="block px-2 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Cryptocurrencies</Link>
                        <Link href="/stocks" className="block px-2 py-2 text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>TSX Stocks</Link>
                        <div className="relative mt-2" ref={searchRef}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search coins..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500"
                            />
                        </div>
                        {showResults && results.length > 0 && (
                            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                                {results.map((coin) => (
                                    <button
                                        key={coin.id}
                                        type="button"
                                        onClick={() => handleSelect(coin)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{coin.name}</p>
                                            <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

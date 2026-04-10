import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Clock, Tag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { blogApi } from '../api';

const CATEGORY_COLORS = {
  guides: 'bg-[#6C63FF]/15 text-[#6C63FF]',
  security: 'bg-[#FF6B6B]/15 text-[#FF6B6B]',
  privacy: 'bg-[#00D4FF]/15 text-[#00D4FF]',
  streaming: 'bg-[#00FF88]/15 text-[#00FF88]',
  news: 'bg-yellow-500/15 text-yellow-400',
  comparisons: 'bg-purple-500/15 text-purple-400',
};

export default function Blog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['blog', search, category],
    queryFn: () => blogApi.getPosts({ search, category, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: catData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogApi.getCategories().then(r => r.data),
  });

  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <motion.div className="mb-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold mb-3">
            Privacy <span className="gradient-text">Knowledge Base</span>
          </h1>
          <p className="text-white/50 text-lg mb-8">Guides, tips, and security deep-dives from our experts.</p>

          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="input-field pl-11 h-12 text-base"
            />
          </div>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30' : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white'}`}
          >
            All
          </button>
          {catData?.categories?.map(c => (
            <button
              key={c._id}
              onClick={() => setCategory(c._id === category ? '' : c._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                category === c._id
                  ? `${CATEGORY_COLORS[c._id] || 'bg-white/10 text-white'} border border-current/20`
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white'
              }`}
            >
              {c._id} <span className="text-xs opacity-60">({c.count})</span>
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.posts?.map((post, i) => (
              <motion.article
                key={post._id}
                className="glass-card-hover p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${CATEGORY_COLORS[post.category] || 'bg-white/10 text-white/60'}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-white/25 flex items-center gap-1">
                    <Clock size={11} /> {post.readingTime} min read
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`} className="block flex-1">
                  <h2 className="font-bold text-base text-white/90 hover:text-white leading-snug mb-3 line-clamp-2 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-white/45 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                </Link>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                  <span className="text-xs text-white/30">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Link to={`/blog/${post.slug}`} className="text-xs text-[#6C63FF] hover:text-[#00D4FF] font-medium transition-colors">
                    Read more →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {data?.posts?.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={40} className="text-white/15 mx-auto mb-4" />
            <p className="text-white/30">No articles found. Try a different search.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

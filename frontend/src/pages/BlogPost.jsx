import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Share2, Twitter, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { blogApi } from '../api';

function MarkdownRenderer({ content }) {
  const html = content
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-2 text-white/70"><span class="text-[#6C63FF] mt-1 shrink-0">•</span>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-2 mb-2 text-white/70"><span class="text-[#6C63FF] font-bold shrink-0">$1.</span>$2</li>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#6C63FF]/15 text-[#6C63FF] text-[13px] font-mono">$1</code>')
    .replace(/\n\n/g, '</p><p class="text-white/65 leading-relaxed mb-4">')
    .replace(/\|(.+)\|/g, (m) => {
      const cells = m.split('|').filter(Boolean).map(c => c.trim());
      if (cells.every(c => c.match(/^[-:]+$/))) return '';
      const isHeader = m.includes('---');
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag} class="px-4 py-3 text-left text-sm text-white/70 border-b border-white/[0.06]">${c}</${tag}>`).join('')}</tr>`;
    });

  return (
    <div
      className="prose prose-invert max-w-none text-white/65 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="text-white/65 leading-relaxed mb-4">${html}</p>` }}
    />
  );
}

export default function BlogPost() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.getPost(slug).then(r => r.data),
  });

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080B14]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 space-y-4">
          <div className="skeleton h-8 w-1/3 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-4 w-1/2 rounded-xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const post = data?.post;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] font-semibold capitalize border border-[#6C63FF]/20">
                {post.category}
              </span>
              <span className="text-xs text-white/30 flex items-center gap-1.5">
                <Clock size={12} /> {post.readingTime} min read
              </span>
              <span className="text-xs text-white/30">
                {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-white/55 leading-relaxed">{post.excerpt}</p>

            {/* Share */}
            <div className="flex items-center gap-2 mt-5">
              <button onClick={share} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-white/50 hover:text-white transition-colors">
                <Copy size={12} /> Copy Link
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-xs text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
              >
                <Twitter size={12} /> Tweet
              </a>
            </div>
          </div>

          {/* Content */}
          <div className="glass-card p-8 md:p-10 mb-10">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/[0.05] text-white/40 border border-white/[0.08]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related */}
          {data?.related?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-5">Related Articles</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {data.related.map(r => (
                  <Link key={r._id} to={`/blog/${r.slug}`} className="glass-card-hover p-4 block">
                    <span className="text-xs text-[#6C63FF] capitalize font-medium">{r.category}</span>
                    <h3 className="text-sm font-bold text-white/80 mt-1 leading-snug line-clamp-2">{r.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

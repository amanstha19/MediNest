import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Clock, TrendingUp, 
  Pill, Command, ArrowRight, Loader2 
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './AISearchModal.css';

const SimpleSearchModal = ({ isOpen, onClose, products, categories }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }

      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else if (query.trim()) {
            performSearch(query);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, suggestions, selectedIndex]);

  // Basic suggestion generation - no AI
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const generateSuggestions = () => {
      const lowerQuery = query.toLowerCase();
      const newSuggestions = [];

      // 1. Direct product matches only
      const productMatches = products
        ?.filter(p => 
          p.generic_name?.toLowerCase().includes(lowerQuery) ||
          p.name?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 5)
        .map(p => ({
          type: 'product',
          title: p.generic_name || p.name,
          subtitle: p.category_label || 'Medicine',
          icon: 'pill',
          data: p
        })) || [];

      newSuggestions.push(...productMatches);

      // 2. Category matches
      const categoryMatches = categories
        ?.filter(c => 
          c.label?.toLowerCase().includes(lowerQuery) ||
          c.value?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 3)
        .map(c => ({
          type: 'category',
          title: c.label,
          subtitle: 'Category',
          icon: 'category',
          data: c
        })) || [];

      newSuggestions.push(...categoryMatches);

      // 3. Search option
      if (lowerQuery.length > 2) {
        newSuggestions.push({
          type: 'search',
          title: `Search "${query}"`,
          subtitle: 'Find all matching products',
          icon: 'search',
          query: query
        });
      }

      setSuggestions(newSuggestions.slice(0, 8));
    };

    const debounceTimer = setTimeout(generateSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [query, products, categories]);

  const performSearch = (searchQuery) => {
    setIsSearching(true);
    
    // Save to recent searches
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Navigate to medicines page with search
    navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
    
    setTimeout(() => {
      setIsSearching(false);
      onClose();
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.data.id}`);
      onClose();
    } else if (suggestion.type === 'category') {
      navigate(`/medicines?category=${suggestion.data.value}`);
      onClose();
    } else if (suggestion.type === 'search') {
      performSearch(suggestion.query || suggestion.title);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="ai-search-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="ai-search-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="ai-search-header">
            <div className="ai-search-input-wrapper">
              <Search className="ai-search-icon" size={20} />
              <input
                ref={inputRef}
                type="text"
                className="ai-search-input"
                placeholder="Search medicines by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="ai-search-clear" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
              <div className="ai-search-badges">
                <span className="kbd-shortcut">
                  <Command size={12} />
                  K
                </span>
              </div>
            </div>
          </div>

          {/* Search Content */}
          <div className="ai-search-content">
            {isSearching ? (
              <div className="ai-search-loading">
                <Loader2 className="spin" size={32} />
                <p>Searching...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="ai-suggestions-list">
                <div className="suggestions-header">
                  <Search size={14} />
                  <span>Search Results</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    className={`ai-suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="suggestion-icon">
                      {suggestion.icon === 'pill' && <Pill size={18} />}
                      {suggestion.icon === 'category' && <TrendingUp size={18} />}
                      {suggestion.icon === 'search' && <Search size={18} />}
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-title">
                        {suggestion.title}
                      </div>
                      <div className="suggestion-subtitle">{suggestion.subtitle}</div>
                    </div>
                    <ArrowRight size={16} className="suggestion-arrow" />
                  </motion.button>
                ))}
              </div>
            ) : query ? (
              <div className="ai-no-results">
                <p>No products found. Press Enter to search anyway.</p>
              </div>
            ) : (
              <div className="ai-search-empty">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="recent-searches">
                    <div className="section-header">
                      <Clock size={14} />
                      <span>Recent Searches</span>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="recent-item"
                        onClick={() => {
                          setQuery(search);
                          performSearch(search);
                        }}
                      >
                        <Clock size={14} />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Categories */}
                <div className="quick-categories">
                  <div className="section-header">
                    <TrendingUp size={14} />
                    <span>Popular Categories</span>
                  </div>
                  <div className="category-chips">
                    {categories?.slice(0, 6).map((cat) => (
                      <button
                        key={cat.value}
                        className="category-chip"
                        onClick={() => {
                          navigate(`/medicines?category=${cat.value}`);
                          onClose();
                        }}
                        style={{ '--chip-color': cat.color }}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div className="ai-tips">
                  <div className="section-header">
                    <Search size={14} />
                    <span>Search Tips</span>
                  </div>
                  <div className="tips-list">
                    <div className="tip-item">💊 Type medicine name (e.g., Paracetamol)</div>
                    <div className="tip-item">🏷️ Search by category (e.g., Vitamins)</div>
                    <div className="tip-item">📋 Browse all products in a category</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="ai-search-footer">
            <div className="footer-hints">
              <span><kbd>↑↓</kbd> to navigate</span>
              <span><kbd>↵</kbd> to select</span>
              <span><kbd>esc</kbd> to close</span>
            </div>
            <div className="ai-powered">
              <Search size={12} />
              Product Search
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

SimpleSearchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  products: PropTypes.array,
  categories: PropTypes.array
};

export default SimpleSearchModal;

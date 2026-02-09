import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Sparkles, Mic, Clock, TrendingUp, 
  Pill, Command, ArrowRight, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AISearchModal.css';

const AISearchModal = ({ isOpen, onClose, onSearch, products, categories }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Medical term synonyms for AI understanding
  const medicalSynonyms = {
    'pain': ['analgesic', 'painkiller', 'relief', 'ache', 'discomfort'],
    'headache': ['migraine', 'head pain', 'cephalalgia'],
    'fever': ['pyrexia', 'temperature', 'febrile'],
    'cold': ['flu', 'influenza', 'cough', 'congestion', 'runny nose'],
    'stomach': ['gastric', 'abdominal', 'digestive', 'acid', 'ulcer'],
    'baby': ['infant', 'pediatric', 'child', 'newborn', 'toddler'],
    'skin': ['dermatology', 'rash', 'acne', 'eczema', 'topical'],
    'heart': ['cardiac', 'cardiovascular', 'blood pressure', 'hypertension'],
    'eye': ['ophthalmic', 'vision', 'ocular', 'drops'],
    'vitamin': ['supplement', 'nutrition', 'mineral', 'multivitamin'],
    'antibiotic': ['antibacterial', 'infection', 'bacterial'],
    'allergy': ['antihistamine', 'hypersensitivity', 'allergic'],
    'sleep': ['insomnia', 'sedative', 'hypnotic', 'rest'],
    'stress': ['anxiety', 'calm', 'relaxation', 'mood'],
    'diabetes': ['blood sugar', 'glucose', 'insulin', 'hypoglycemic'],
  };

  // Category intent mapping
  const categoryIntents = {
    'baby': 'PED', 'infant': 'PED', 'child': 'PED', 'pediatric': 'PED',
    'prescription': 'RX', 'rx': 'RX', 'doctor': 'RX',
    'otc': 'OTC', 'over the counter': 'OTC', 'general': 'OTC',
    'vitamin': 'SUP', 'supplement': 'SUP', 'nutrition': 'SUP',
    'woman': 'WOM', 'women': 'WOM', 'female': 'WOM',
    'man': 'MEN', 'men': 'MEN', 'male': 'MEN',
    'herbal': 'HERB', 'ayurvedic': 'HERB', 'natural': 'HERB',
    'device': 'DIAG', 'monitor': 'DIAG', 'machine': 'DIAG',
    'first aid': 'FIRST', 'emergency': 'FIRST', 'bandage': 'FIRST',
  };

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
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) onClose(); // Toggle
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }

      // Arrow navigation
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

  // AI-powered suggestion generation
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const generateSuggestions = () => {
      const lowerQuery = query.toLowerCase();
      const newSuggestions = [];

      // 1. Direct product matches
      const productMatches = products
        ?.filter(p => 
          p.generic_name?.toLowerCase().includes(lowerQuery) ||
          p.name?.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 3)
        .map(p => ({
          type: 'product',
          title: p.generic_name || p.name,
          subtitle: p.category_label || 'Medicine',
          icon: 'pill',
          data: p,
          relevance: 100
        })) || [];

      newSuggestions.push(...productMatches);

      // 2. AI synonym expansion
      Object.entries(medicalSynonyms).forEach(([term, synonyms]) => {
        if (lowerQuery.includes(term) || synonyms.some(s => lowerQuery.includes(s))) {
          const synonymProducts = products
            ?.filter(p => 
              p.generic_name?.toLowerCase().includes(term) ||
              p.description?.toLowerCase().includes(term) ||
              synonyms.some(s => p.description?.toLowerCase().includes(s))
            )
            .slice(0, 2)
            .map(p => ({
              type: 'ai-suggestion',
              title: p.generic_name || p.name,
              subtitle: `AI match: ${term} medicine`,
              icon: 'sparkles',
              data: p,
              relevance: 85,
              aiBadge: true
            })) || [];
          newSuggestions.push(...synonymProducts);
        }
      });

      // 3. Category intent detection
      Object.entries(categoryIntents).forEach(([intent, category]) => {
        if (lowerQuery.includes(intent)) {
          const cat = categories?.find(c => c.value === category);
          if (cat) {
            newSuggestions.push({
              type: 'category',
              title: cat.label,
              subtitle: `AI detected: ${intent} products`,
              icon: 'category',
              data: cat,
              relevance: 90,
              aiBadge: true
            });
          }
        }
      });

      // 4. Smart search queries
      if (lowerQuery.length > 2) {
        newSuggestions.push({
          type: 'search',
          title: `Search "${query}"`,
          subtitle: 'Find all matching products',
          icon: 'search',
          query: query,
          relevance: 70
        });
      }

      // Remove duplicates and sort by relevance
      const unique = newSuggestions.filter((item, index, self) => 
        index === self.findIndex(t => t.title === item.title)
      );
      
      setSuggestions(unique.sort((a, b) => b.relevance - a.relevance).slice(0, 8));
    };

    const debounceTimer = setTimeout(generateSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [query, products, categories]);

  const performSearch = (searchQuery, aiEnhanced = true) => {
    setIsSearching(true);
    
    // Save to recent searches
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Detect category intent
    const lowerQuery = searchQuery.toLowerCase();
    let detectedCategory = '';
    Object.entries(categoryIntents).forEach(([intent, category]) => {
      if (lowerQuery.includes(intent)) {
        detectedCategory = category;
      }
    });

    // Call parent search with AI enhancements
    onSearch({
      query: searchQuery,
      category: detectedCategory,
      aiEnhanced: aiEnhanced,
      synonyms: getSynonyms(searchQuery)
    });

    setTimeout(() => {
      setIsSearching(false);
      onClose();
    }, 300);
  };

  const getSynonyms = (searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    const synonyms = [];
    Object.entries(medicalSynonyms).forEach(([term, termSynonyms]) => {
      if (lowerQuery.includes(term) || termSynonyms.some(s => lowerQuery.includes(s))) {
        synonyms.push(term, ...termSynonyms);
      }
    });
    return [...new Set(synonyms)];
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product' || suggestion.type === 'ai-suggestion') {
      // Navigate to product
      navigate(`/product/${suggestion.data.id}`);
      onClose();
    } else if (suggestion.type === 'category') {
      // Navigate to category
      navigate(`/medicines?category=${suggestion.data.value}`);
      onClose();
    } else if (suggestion.type === 'search') {
      performSearch(suggestion.query || suggestion.title);
    }
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        performSearch(transcript);
      };

      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
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
          ref={modalRef}
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
                placeholder="Search medicines, symptoms, or categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button className="ai-search-clear" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
              <div className="ai-search-badges">
                <span className="ai-badge">
                  <Sparkles size={12} />
                  AI
                </span>
                <button 
                  className={`voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={startVoiceSearch}
                  title="Voice search"
                >
                  <Mic size={16} />
                </button>
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
                <p>AI is searching...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="ai-suggestions-list">
                <div className="suggestions-header">
                  <Sparkles size={14} />
                  <span>AI-Powered Suggestions</span>
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
                      {suggestion.icon === 'sparkles' && <Sparkles size={18} />}
                      {suggestion.icon === 'category' && <TrendingUp size={18} />}
                      {suggestion.icon === 'search' && <Search size={18} />}
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-title">
                        {suggestion.title}
                        {suggestion.aiBadge && (
                          <span className="ai-match-badge">AI Match</span>
                        )}
                      </div>
                      <div className="suggestion-subtitle">{suggestion.subtitle}</div>
                    </div>
                    <ArrowRight size={16} className="suggestion-arrow" />
                  </motion.button>
                ))}
              </div>
            ) : query ? (
              <div className="ai-no-results">
                <p>No suggestions found. Press Enter to search.</p>
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

                {/* AI Tips */}
                <div className="ai-tips">
                  <div className="section-header">
                    <Sparkles size={14} />
                    <span>AI Search Tips</span>
                  </div>
                  <div className="tips-list">
                    <div className="tip-item">💊 Try "medicine for headache"</div>
                    <div className="tip-item">👶 Try "baby fever medicine"</div>
                    <div className="tip-item">🌿 Try "herbal supplements"</div>
                    <div className="tip-item">💊 Try "pain relief tablets"</div>
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
              <Sparkles size={12} />
              AI-Powered Search
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AISearchModal;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, MessageCircle, Shield, Truck, CreditCard, Ambulance, FileText, TestTube, Lock } from 'lucide-react';
import './pages.css';

function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I place an order for medicines on MediNest?",
      answer: "To place an order, browse our medicine catalog, add items to your cart, and proceed to checkout. You'll need to upload a valid prescription for prescription medicines. Our AI-powered search helps you find medicines quickly.",
      icon: <FileText size={20} />
    },
    {
      question: "Do I need a prescription to buy medicines?",
      answer: "Yes, prescription medicines require a valid doctor's prescription. You can upload it during the checkout process. Over-the-counter medicines can be purchased without a prescription.",
      icon: <Shield size={20} />
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 1-3 business days depending on your location. Express delivery options are available for urgent orders. We partner with reliable logistics for safe and timely delivery.",
      icon: <Truck size={20} />
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, digital wallets (Khalti, eSewa), and cash on delivery. All payments are processed securely.",
      icon: <CreditCard size={20} />
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "Orders can be cancelled or modified within 1 hour of placement. Please contact our customer support team for assistance. Refunds will be processed according to our policy."
    },
    {
      question: "What if I receive the wrong medicine?",
      answer: "If you receive the wrong medicine, please contact us immediately at support@medinest.com or call our helpline. We'll arrange for a replacement or full refund at no extra cost."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order status in your account dashboard or contact support for updates."
    },
    {
      question: "Are my personal and medical details secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your personal and medical information. We comply with all relevant data protection regulations and never share your data without consent.",
      icon: <Lock size={20} />
    },
    {
      question: "What should I do if I have side effects from a medicine?",
      answer: "If you experience side effects, stop taking the medicine immediately and consult your doctor or healthcare provider. Contact our pharmacist support if you need assistance with medication guidance."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team via phone (+977-1-234567), email (support@medinest.com), or through the live chat feature on our website. We're available 24/7 for urgent inquiries.",
      icon: <Phone size={20} />
    },
    {
      question: "Do you offer emergency ambulance services?",
      answer: "Yes, MediNest provides emergency ambulance booking services. You can book an ambulance through our app or website for immediate medical transportation.",
      icon: <Ambulance size={20} />
    },
    {
      question: "Can I upload prescriptions for verification?",
      answer: "Absolutely! Our advanced OCR technology allows you to upload handwritten or digital prescriptions for quick verification by our licensed pharmacists.",
      icon: <FileText size={20} />
    },
    {
      question: "What if my prescription is handwritten?",
      answer: "Our AI-powered handwriting recognition can process handwritten prescriptions. Simply upload a clear photo, and our system will extract the medication details for verification."
    },
    {
      question: "Do you provide lab test booking?",
      answer: "Yes, MediNest offers lab test booking services. You can schedule various diagnostic tests through our platform and get results delivered securely.",
      icon: <TestTube size={20} />
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your email to reset your password securely.",
      icon: <Lock size={20} />
    }
  ];

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      {/* Hero Section */}
      <div className="eh-hero" style={{
        marginBottom: 'var(--eh-spacing-2xl)',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        padding: '40px 24px',
        borderRadius: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(138, 43, 226, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 20, 147, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
            <HelpCircle size={48} />
          </div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 900,
            marginBottom: '10px',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #dbeafe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.95, marginBottom: '24px' }}>
            Find answers to common questions about MediNest services
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ marginBottom: 'var(--eh-spacing-2xl)' }}
      >
        <div style={{ display: 'grid', gap: 'var(--eh-spacing-lg)', maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {faq.icon && <span style={{ color: 'var(--primary)' }}>{faq.icon}</span>}
                  <span>{faq.question}</span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                style={{
                  overflow: 'hidden',
                  borderTop: openIndex === index ? '1px solid rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <p style={{ margin: 0 }}>{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '20px',
          padding: '40px 24px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--primary)' }}>
          <MessageCircle size={48} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Still have questions?
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1rem' }}>
          Our customer support team is here to help you 24/7.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a
            href="tel:+977-1-234567"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '30px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Phone size={18} />
            Call Us
          </a>
          <a
            href="mailto:support@medinest.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              borderRadius: '30px',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Mail size={18} />
            Email Us
          </a>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '30px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <MessageCircle size={18} />
            Live Chat
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default FAQs;
